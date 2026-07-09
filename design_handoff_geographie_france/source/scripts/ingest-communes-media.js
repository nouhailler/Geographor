#!/usr/bin/env node
/**
 * Ingestion des blasons / drapeaux / photos de communes françaises
 * depuis Wikidata (SPARQL) + Wikimedia Commons (API imageinfo).
 *
 * Usage :
 *   node ingest-communes-media.js communes.json communes-media.json
 *
 * communes.json attendu : tableau d'objets { code: "75056", nom: "Paris", ... }
 * (ex. export de https://geo.api.gouv.fr/communes?fields=nom,code&format=json)
 *
 * Nécessite Node.js >= 18 (fetch natif). Aucune dépendance externe.
 */

const fs = require('fs');

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const BATCH_SIZE = 150;          // codes INSEE par requête SPARQL
const THROTTLE_MS = 1200;        // pause entre requêtes (politesse envers les serveurs WMF)
const USER_AGENT = 'GeographieFranceApp/1.0 (contact: votre-email@example.com)';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// Construit la requête SPARQL pour un lot de codes INSEE.
function buildQuery(codes) {
  const values = codes.map(c => `"${c}"`).join(' ');
  return `
    SELECT ?insee ?item ?itemLabel ?blason ?drapeau ?image ?commonsCat WHERE {
      VALUES ?insee { ${values} }
      ?item wdt:P374 ?insee.
      OPTIONAL { ?item wdt:P94 ?blason. }
      OPTIONAL { ?item wdt:P41 ?drapeau. }
      OPTIONAL { ?item wdt:P18 ?image. }
      OPTIONAL { ?item wdt:P373 ?commonsCat. }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr". }
    }
  `;
}

async function sparql(query) {
  const url = SPARQL_ENDPOINT + '?query=' + encodeURIComponent(query) + '&format=json';
  const res = await fetch(url, { headers: { 'Accept': 'application/sparql-results+json', 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error('SPARQL HTTP ' + res.status + ' — ' + (await res.text()).slice(0, 300));
  const json = await res.json();
  return json.results.bindings;
}

// Extrait le nom de fichier Commons depuis une URL "http://commons.wikimedia.org/wiki/Special:FilePath/XXX.svg"
function filenameFromCommonsUrl(url) {
  if (!url) return null;
  const m = decodeURIComponent(url).match(/Special:FilePath\/(.+)$/);
  return m ? m[1] : null;
}

// Résout un nom de fichier Commons en { url, licence, attribution } via l'API imageinfo.
async function resolveFile(filename) {
  if (!filename) return null;
  const params = new URLSearchParams({
    action: 'query', format: 'json', titles: 'File:' + filename,
    prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '600'
  });
  const res = await fetch(COMMONS_API + '?' + params.toString(), { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) return null;
  const json = await res.json();
  const pages = json.query && json.query.pages;
  if (!pages) return null;
  const page = Object.values(pages)[0];
  const info = page && page.imageinfo && page.imageinfo[0];
  if (!info) return null;
  const meta = info.extmetadata || {};
  const strip = html => (html || '').replace(/<[^>]+>/g, '').trim();
  return {
    url: info.thumburl || info.url,
    fullUrl: info.url,
    licence: strip(meta.LicenseShortName && meta.LicenseShortName.value),
    attribution: strip(meta.Artist && meta.Artist.value) || strip(meta.Credit && meta.Credit.value) || '',
  };
}

async function main() {
  const [, , inputPath, outputPath] = process.argv;
  if (!inputPath || !outputPath) {
    console.error('Usage: node ingest-communes-media.js communes.json communes-media.json');
    process.exit(1);
  }

  const communes = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const codes = communes.map(c => c.code || c.codeInsee || c.insee).filter(Boolean);

  // Reprise : charger le résultat déjà écrit s'il existe.
  let out = {};
  if (fs.existsSync(outputPath)) {
    try { out = JSON.parse(fs.readFileSync(outputPath, 'utf8')); } catch (e) { out = {}; }
  }
  const remaining = codes.filter(c => !out[c]);
  console.log(`${codes.length} communes au total, ${remaining.length} restantes à traiter.`);

  const batches = chunk(remaining, BATCH_SIZE);
  const missing = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`Lot ${i + 1}/${batches.length} (${batch.length} codes)…`);
    let bindings;
    try {
      bindings = await sparql(buildQuery(batch));
    } catch (e) {
      console.error('Erreur SPARQL, nouvelle tentative après pause :', e.message);
      await sleep(5000);
      try { bindings = await sparql(buildQuery(batch)); } catch (e2) {
        console.error('Échec définitif pour ce lot, passage au suivant.', e2.message);
        continue;
      }
    }

    // Regrouper par code INSEE (un item peut avoir plusieurs lignes si plusieurs blasons/images).
    const byCode = {};
    for (const b of bindings) {
      const code = b.insee.value;
      byCode[code] = byCode[code] || { blason: null, drapeau: null, image: null, commonsCat: null };
      if (b.blason && !byCode[code].blason) byCode[code].blason = b.blason.value;
      if (b.drapeau && !byCode[code].drapeau) byCode[code].drapeau = b.drapeau.value;
      if (b.image && !byCode[code].image) byCode[code].image = b.image.value;
      if (b.commonsCat && !byCode[code].commonsCat) byCode[code].commonsCat = b.commonsCat.value;
    }

    for (const code of batch) {
      const row = byCode[code];
      if (!row) { missing.push(code); out[code] = null; continue; }

      const blasonFile = filenameFromCommonsUrl(row.blason);
      const drapeauFile = filenameFromCommonsUrl(row.drapeau);
      const imageFile = filenameFromCommonsUrl(row.image);

      const [blasonInfo, drapeauInfo, imageInfo] = await Promise.all([
        resolveFile(blasonFile), resolveFile(drapeauFile), resolveFile(imageFile)
      ]);
      await sleep(200); // petite pause entre résolutions de fichiers

      out[code] = {
        blason: blasonInfo ? { url: blasonInfo.url, licence: blasonInfo.licence, attribution: blasonInfo.attribution } : null,
        drapeau: drapeauInfo ? { url: drapeauInfo.url, licence: drapeauInfo.licence, attribution: drapeauInfo.attribution } : null,
        photo: imageInfo ? { url: imageInfo.url, licence: imageInfo.licence, attribution: imageInfo.attribution } : null,
        commonsCategory: row.commonsCat ? decodeURIComponent(row.commonsCat.split('Category:')[1] || '') : null
      };
      if (!blasonInfo && !imageInfo) missing.push(code);
    }

    // Écriture progressive : on peut interrompre le script (Ctrl+C) sans tout reperdre.
    fs.writeFileSync(outputPath, JSON.stringify(out, null, 2));
    await sleep(THROTTLE_MS);
  }

  fs.writeFileSync(outputPath.replace(/\.json$/, '') + '-manquants.json', JSON.stringify(missing, null, 2));
  console.log(`Terminé. ${Object.keys(out).length} communes écrites dans ${outputPath}.`);
  console.log(`${missing.length} communes sans blason ni photo — voir le fichier "-manquants.json".`);
}

main().catch(e => { console.error(e); process.exit(1); });
