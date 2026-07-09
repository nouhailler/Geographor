import { useCallback, useEffect, useState } from 'react'

export interface OpenRouterModel {
  id: string
  name?: string
  pricing?: { prompt?: string; completion?: string }
}

const KEY_API = 'gf_openrouter_key'
const KEY_MODEL = 'gf_openrouter_model'

/**
 * Paramètres IA (OpenRouter). La clé et le modèle sont persistés en localStorage
 * uniquement — jamais transmis ailleurs. La liste des modèles gratuits est
 * récupérée en direct depuis l'API OpenRouter (id se terminant par « :free »).
 */
export function useSettings() {
  const [apiKey, setApiKey] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [freeModels, setFreeModels] = useState<OpenRouterModel[]>([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelsError, setModelsError] = useState<string | null>(null)

  useEffect(() => {
    try {
      setApiKey(localStorage.getItem(KEY_API) || '')
      setSelectedModel(localStorage.getItem(KEY_MODEL) || '')
    } catch {
      /* localStorage indisponible */
    }
  }, [])

  const loadFreeModels = useCallback(async () => {
    setModelsLoading(true)
    setModelsError(null)
    try {
      const res = await fetch('https://openrouter.ai/api/v1/models')
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const json = await res.json()
      const free: OpenRouterModel[] = (json.data || [])
        .filter((m: OpenRouterModel) => {
          const p = m.pricing || {}
          return (
            (m.id && m.id.endsWith(':free')) ||
            (parseFloat(p.prompt || '1') === 0 && parseFloat(p.completion || '1') === 0)
          )
        })
        .sort((a: OpenRouterModel, b: OpenRouterModel) =>
          (a.name || a.id).localeCompare(b.name || b.id),
        )
      setFreeModels(free)
    } catch (e) {
      setModelsError(
        'Impossible de charger la liste des modèles (' + (e as Error).message + ').',
      )
    } finally {
      setModelsLoading(false)
    }
  }, [])

  const save = useCallback((key: string, model: string) => {
    try {
      localStorage.setItem(KEY_API, key)
      localStorage.setItem(KEY_MODEL, model)
    } catch {
      /* ignore */
    }
    setApiKey(key)
    setSelectedModel(model)
  }, [])

  return {
    apiKey,
    selectedModel,
    freeModels,
    modelsLoading,
    modelsError,
    loadFreeModels,
    save,
  }
}
