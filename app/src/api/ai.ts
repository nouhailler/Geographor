// Fonction IA concrète : synthèse d'une fiche via un modèle OpenRouter (gratuit) choisi
// dans les paramètres. La clé n'est transmise qu'à OpenRouter.
import type { FicheModel } from '../lib/fiche'

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'

const KIND_LABEL: Record<FicheModel['kind'], string> = {
  region: 'la région',
  dep: 'le département',
  commune: 'la commune',
  lieu: 'le lieu',
}

/** Construit un prompt à partir des données déjà affichées dans la fiche. */
export function buildFichePrompt(m: FicheModel): string {
  const facts = m.rows.map(([k, v]) => `- ${k} : ${v}`).join('\n')
  const texts = m.texts.map(([t, body]) => `## ${t}\n${body}`).join('\n\n')
  return [
    `Rédige une synthèse claire et fluide (4 à 6 phrases, en français) présentant ${KIND_LABEL[m.kind]} « ${m.titre} ».`,
    `Appuie-toi uniquement sur les données ci-dessous, sans inventer de chiffres ni de faits. Termine par un point d'intérêt marquant.`,
    '',
    `# ${m.titre} (${m.badge})`,
    m.sous ? `Sous-titre : ${m.sous}` : '',
    '',
    'Données :',
    facts || '(aucune donnée chiffrée)',
    texts ? '\nContexte :\n' + texts : '',
  ]
    .filter(Boolean)
    .join('\n')
}

export interface SummarizeOptions {
  apiKey: string
  model: string
  prompt: string
  signal?: AbortSignal
}

export async function summarizeFiche(opts: SummarizeOptions): Promise<string> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': typeof location !== 'undefined' ? location.origin : 'https://geo-france.app',
      'X-Title': 'Géographie de France',
    },
    body: JSON.stringify({
      model: opts.model,
      temperature: 0.4,
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content:
            "Tu es un géographe pédagogue. Tu produis des synthèses concises et exactes, en français, sans jamais inventer de données. N'ajoute pas de titre ni de puces : rends un unique paragraphe.",
        },
        { role: 'user', content: opts.prompt },
      ],
    }),
    signal: opts.signal,
  })

  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const j = await res.json()
      detail = j?.error?.message || detail
    } catch {
      /* ignore */
    }
    throw new Error(detail)
  }

  const json = await res.json()
  const content: string | undefined = json?.choices?.[0]?.message?.content
  if (!content) throw new Error('Réponse vide du modèle.')
  return content.trim()
}
