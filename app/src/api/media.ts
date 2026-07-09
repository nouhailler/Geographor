// Enrichissement média/texte d'une commune via Wikidata (Commons) et Wikipédia.
// - Wikidata SPARQL : code INSEE (P374) → blason (P94), drapeau/logo (P41), photo (P18),
//   gentilé (P1549), altitude (P2044), catégorie Commons (P373), lien Wikipédia FR.
// - Maire en cours : statement P6 sans date de fin (P582), date de début (P580) la plus récente.
// - Photos additionnelles : membres image de la catégorie Commons (API Commons).
// - Wikipédia REST summary : premier paragraphe (« historique »).
import type { CommuneMedia } from '../types'

const cache = new Map<string, CommuneMedia>()
const MAX_PHOTOS = 4
const IMG_EXT = /\.(jpe?g|png)$/i

/** URL directe d'un fichier Commons (Special:FilePath redirige vers upload.wikimedia.org). */
function commonsFile(uriOrName: string, width = 480): string {
  const isUri = /^https?:/.test(uriOrName)
  const base = isUri
    ? uriOrName.replace(/^http:/, 'https:')
    : `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(uriOrName)}`
  return base.includes('?') ? `${base}&width=${width}` : `${base}?width=${width}`
}

interface SparqlBinding {
  blason?: { value: string }
  drapeau?: { value: string }
  image?: { value: string }
  demonym?: { value: string }
  elevation?: { value: string }
  article?: { value: string }
  cat?: { value: string }
}

async function sparql(query: string): Promise<Record<string, { value: string }>[]> {
  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`
  const res = await fetch(url, { headers: { Accept: 'application/sparql-results+json' } })
  if (!res.ok) throw new Error(`Wikidata ${res.status}`)
  const json = await res.json()
  return json?.results?.bindings ?? []
}

async function queryMain(insee: string): Promise<SparqlBinding | null> {
  const q = `
    SELECT ?blason ?drapeau ?image ?demonym ?elevation ?cat ?article WHERE {
      ?ville wdt:P374 "${insee}".
      OPTIONAL { ?ville wdt:P94 ?blason. }
      OPTIONAL { ?ville wdt:P41 ?drapeau. }
      OPTIONAL { ?ville wdt:P18 ?image. }
      OPTIONAL { ?ville wdt:P1549 ?demonym. FILTER(LANG(?demonym) = "fr") }
      OPTIONAL { ?ville wdt:P2044 ?elevation. }
      OPTIONAL { ?ville wdt:P373 ?cat. }
      OPTIONAL {
        ?article schema:about ?ville ; schema:isPartOf <https://fr.wikipedia.org/> .
      }
    } LIMIT 1`
  const rows = await sparql(q)
  return (rows[0] as SparqlBinding) ?? null
}

async function queryMaire(insee: string): Promise<string | undefined> {
  const q = `
    SELECT ?maireLabel ?start WHERE {
      ?ville wdt:P374 "${insee}".
      ?ville p:P6 ?st.
      ?st ps:P6 ?maire.
      ?maire rdfs:label ?maireLabel. FILTER(LANG(?maireLabel) = "fr")
      OPTIONAL { ?st pq:P580 ?start. }
      FILTER NOT EXISTS { ?st pq:P582 ?end. }
    } ORDER BY DESC(?start) LIMIT 1`
  try {
    const rows = await sparql(q)
    return rows[0]?.maireLabel?.value
  } catch {
    return undefined
  }
}

async function categoryImages(cat: string, exclude?: string): Promise<string[]> {
  try {
    const url =
      `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*` +
      `&list=categorymembers&cmtype=file&cmlimit=20&cmtitle=Category:${encodeURIComponent(cat)}`
    const res = await fetch(url)
    if (!res.ok) return []
    const json = await res.json()
    const members: { title: string }[] = json?.query?.categorymembers ?? []
    const excludeName = exclude ? decodeURIComponent(exclude.split('/').pop() ?? '') : ''
    return members
      .map((m) => m.title.replace(/^File:/, ''))
      .filter((name) => IMG_EXT.test(name))
      // évite les cartes de localisation / blasons déjà affichés ailleurs
      .filter((name) => !/(location|carte|map|blason|coat of arms|flag|logo)/i.test(name))
      .filter((name) => name !== excludeName)
      .slice(0, MAX_PHOTOS)
      .map((name) => commonsFile(name, 480))
  } catch {
    return []
  }
}

async function fetchWikipediaSummary(articleUrl?: string): Promise<{ extract?: string; url?: string }> {
  if (!articleUrl) return {}
  const title = decodeURIComponent(articleUrl.split('/wiki/')[1] ?? '')
  if (!title) return {}
  try {
    const res = await fetch(
      `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
    )
    if (!res.ok) return { url: articleUrl }
    const json = await res.json()
    return { extract: json.extract as string | undefined, url: articleUrl }
  } catch {
    return { url: articleUrl }
  }
}

/** Charge blason/drapeau/photos + gentilé + altitude + maire + historique pour une commune (par INSEE). */
export async function fetchCommuneMedia(insee: string): Promise<CommuneMedia> {
  const hit = cache.get(insee)
  if (hit) return hit

  const empty: CommuneMedia = { photos: [], loading: false }
  try {
    const b = await queryMain(insee)
    if (!b) {
      cache.set(insee, empty)
      return empty
    }

    // En parallèle : maire, résumé Wikipédia, photos de catégorie Commons.
    const [maire, wiki, catPhotos] = await Promise.all([
      queryMaire(insee),
      fetchWikipediaSummary(b.article?.value),
      b.cat ? categoryImages(b.cat.value, b.image?.value) : Promise.resolve<string[]>([]),
    ])

    const photos: string[] = []
    if (b.image) photos.push(commonsFile(b.image.value, 480))
    for (const p of catPhotos) {
      if (photos.length >= MAX_PHOTOS) break
      if (!photos.includes(p)) photos.push(p)
    }

    const media: CommuneMedia = {
      blason: b.blason ? commonsFile(b.blason.value, 300) : undefined,
      drapeau: b.drapeau ? commonsFile(b.drapeau.value, 300) : undefined,
      photos,
      gentile: b.demonym?.value,
      elevation: b.elevation ? Math.round(parseFloat(b.elevation.value)) : undefined,
      maire,
      wikipediaUrl: wiki.url,
      historique: wiki.extract,
      loading: false,
    }
    cache.set(insee, media)
    return media
  } catch {
    return empty
  }
}
