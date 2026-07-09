import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header'
import Sidebar, { type Crumb } from './components/Sidebar'
import MapView, { type MapHandle } from './components/MapView'
import Fiche, { type AiState } from './components/Fiche'
import Legend from './components/Legend'
import MapLegend from './components/MapLegend'
import SettingsModal from './components/SettingsModal'
import {
  fetchRegions,
  fetchDepartements,
  fetchCommunesOfDep,
  searchCommunes,
  aggregateDep,
  communeLatLng,
} from './api/geo'
import { fetchCommuneMedia } from './api/media'
import { summarizeFiche, buildFichePrompt } from './api/ai'
import { buildStaticIndex, runSearch, type IndexEntry } from './lib/search'
import { buildThemeScale } from './lib/theme'
import { buildFicheModel } from './lib/fiche'
import { useSettings } from './state/useSettings'
import type { NavActions } from './state/actions'
import type {
  ApiDepartement,
  ApiRegion,
  BaseMap,
  CommuneMedia,
  FicheRef,
  LayerKey,
  LayerState,
  MetricKey,
  SearchResult,
  TabId,
} from './types'

const INITIAL_LAYERS: LayerState = {
  prefs: false,
  villes: true,
  fleuves: false,
  sommets: false,
  parcs: false,
  lacs: false,
}

export default function App() {
  // --- Navigation / carte ---
  const [tab, setTab] = useState<TabId>('carte')
  const [loading, setLoading] = useState(true)
  const [sideDisplay, setSideDisplay] = useState<'flex' | 'none'>(
    typeof window !== 'undefined' && window.innerWidth <= 900 ? 'none' : 'flex',
  )
  const [layers, setLayers] = useState<LayerState>(INITIAL_LAYERS)
  const [base, setBase] = useState<BaseMap>('plan')
  const [metric, setMetric] = useState<MetricKey>('pop')
  const [regionSel, setRegionSel] = useState<string | null>(null)
  const [depSel, setDepSel] = useState<string | null>(null)
  const [ficheRef, setFicheRef] = useState<FicheRef | null>(null)

  // --- Données réelles ---
  const [regions, setRegions] = useState<ApiRegion[]>([])
  const [deps, setDeps] = useState<ApiDepartement[]>([])
  const [communeMedia, setCommuneMedia] = useState<CommuneMedia | null>(null)
  const [depAgg, setDepAgg] = useState<{ population: number; nbCommunes: number; supKm2: number } | null>(null)

  // --- Recherche ---
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchOpen, setSearchOpen] = useState(false)

  // --- Paramètres IA ---
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settings = useSettings()
  const [ai, setAi] = useState<Omit<AiState, 'canUse'>>({ status: 'idle' })
  const aiSeq = useRef(0)
  const aiAbort = useRef<AbortController | null>(null)
  const aiCanUse = !!settings.apiKey && !!settings.selectedModel

  const mapRef = useRef<MapHandle>(null)
  const staticIndexRef = useRef<IndexEntry[]>([])
  const searchSeq = useRef(0)
  const mediaSeq = useRef(0)
  const depAggSeq = useRef(0)

  // Maps dérivées
  const depRegionMap = useMemo(() => new Map(deps.map((d) => [d.code, d.codeRegion])), [deps])
  const regionNames = useMemo(() => new Map(regions.map((r) => [r.code, r.nom])), [regions])
  const depNames = useMemo(() => new Map(deps.map((d) => [d.code, d.nom])), [deps])

  // Miroir d'état pour les actions stables (évite les closures périmées)
  const S = useRef({ regionSel, depSel, layers, depRegionMap })
  S.current = { regionSel, depSel, layers, depRegionMap }

  // Charge les listes admin au démarrage
  useEffect(() => {
    Promise.all([fetchRegions(), fetchDepartements()])
      .then(([rg, dp]) => {
        setRegions(rg)
        setDeps(dp)
      })
      .catch(() => {
        /* réseau indisponible : la carte reste utilisable via GeoJSON */
      })
  }, [])

  // --- Fiche helpers ---
  const openFiche = useCallback((ref: FicheRef) => {
    setFicheRef(ref)
    if (ref.kind !== 'commune') setCommuneMedia(null)
  }, [])

  const closeFiche = useCallback(() => {
    setFicheRef(null)
    setCommuneMedia(null)
  }, [])

  // Charge les communes d'un département (marqueurs + stats agrégées réelles)
  const loadCommunesOfDep = useCallback((code: string) => {
    const seq = ++depAggSeq.current
    setDepAgg(null)
    fetchCommunesOfDep(code)
      .then((list) => {
        if (seq !== depAggSeq.current) return
        mapRef.current?.setCommuneMarkers(list)
        setDepAgg(aggregateDep(list))
      })
      .catch(() => {
        if (seq === depAggSeq.current) setDepAgg(null)
      })
  }, [])

  // --- Actions de navigation (stables) ---
  const actions = useMemo<NavActions>(() => {
    const drawRegion = (code: string) => {
      mapRef.current?.focusRegion(code)
      mapRef.current?.clearCommuneMarkers()
      setRegionSel(code)
      setDepSel(null)
    }

    const a: NavActions = {
      selectRegion(code) {
        drawRegion(code)
        openFiche({ kind: 'region', code })
      },
      selectDep(code) {
        const region = S.current.depRegionMap.get(code)
        if (region && region !== S.current.regionSel) {
          mapRef.current?.focusRegion(region)
          setRegionSel(region)
        }
        setDepSel(code)
        mapRef.current?.focusDep(code)
        loadCommunesOfDep(code)
        openFiche({ kind: 'dep', code })
      },
      openCommune(c) {
        const seq = ++mediaSeq.current
        setCommuneMedia({ photos: [], loading: true })
        setFicheRef({ kind: 'commune', commune: c })
        const ll = communeLatLng(c)
        if (ll) mapRef.current?.flyTo(ll, 12)
        fetchCommuneMedia(c.code).then((m) => {
          if (seq === mediaSeq.current) setCommuneMedia(m)
        })
      },
      openLieu(badge, titre, sous, latlng, zoom, rows) {
        openFiche({ kind: 'lieu', badge, titre, sous, rows })
        if (latlng) mapRef.current?.flyTo(latlng, zoom ?? 8)
      },
      ensureLayer(key) {
        setLayers((prev) => (prev[key] ? prev : { ...prev, [key]: true }))
      },
      resetFrance() {
        mapRef.current?.clearDepLayer()
        mapRef.current?.clearCommuneMarkers()
        mapRef.current?.fitFrance()
        setRegionSel(null)
        setDepSel(null)
        closeFiche()
      },
    }
    return a
  }, [openFiche, closeFiche, loadCommunesOfDep])

  // Construit l'index de recherche dès que les départements sont chargés
  useEffect(() => {
    if (deps.length) staticIndexRef.current = buildStaticIndex(deps, actions)
  }, [deps, actions])

  // --- Handlers carte ---
  const onRegionFeatureClick = useCallback(
    (code: string) => {
      if (tab === 'theme') openFiche({ kind: 'region', code })
      else actions.selectRegion(code)
    },
    [tab, actions, openFiche],
  )
  const onDepFeatureClick = useCallback((code: string) => actions.selectDep(code), [actions])
  const onVilleClick = useCallback(
    (nom: string, lat: number, lng: number, pop: number) => {
      searchCommunes(nom, 1)
        .then((found) => {
          const exact = found.find((c) => c.nom.toLowerCase() === nom.toLowerCase()) ?? found[0]
          if (exact) actions.openCommune(exact)
          else
            actions.openLieu('Ville', nom, pop.toLocaleString('fr-FR') + ' habitants', [lat, lng], 11, [
              ['Population', pop.toLocaleString('fr-FR') + ' hab.'],
            ])
        })
        .catch(() =>
          actions.openLieu('Ville', nom, pop.toLocaleString('fr-FR') + ' habitants', [lat, lng], 11, [
            ['Population', pop.toLocaleString('fr-FR') + ' hab.'],
          ]),
        )
    },
    [actions],
  )

  // --- Onglets / thématiques ---
  // En mobile, l'onglet agit comme un panneau bascule : recliquer l'onglet actif
  // referme la sidebar ; changer d'onglet l'ouvre sur le nouveau contenu.
  const tabRef = useRef(tab)
  tabRef.current = tab
  const onTab = useCallback((id: TabId) => {
    if (window.innerWidth <= 900) {
      setSideDisplay((disp) => (disp === 'flex' && id === tabRef.current ? 'none' : 'flex'))
    }
    setTab(id)
    if (id === 'phys') {
      setLayers((prev) => ({ ...prev, fleuves: true, sommets: true, parcs: true, lacs: true }))
    }
  }, [])

  // Tap sur la carte : ferme la sidebar en mobile (jamais sur desktop où elle est permanente)
  const onMapClick = useCallback(() => {
    if (window.innerWidth <= 900) setSideDisplay((d) => (d === 'flex' ? 'none' : d))
  }, [])

  const onToggleLayer = useCallback((k: LayerKey) => {
    setLayers((prev) => ({ ...prev, [k]: !prev[k] }))
  }, [])

  const onSetBase = useCallback((b: BaseMap) => setBase(b), [])

  // --- Recherche ---
  const onSearchChange = useCallback(
    (v: string) => {
      setSearchQ(v)
      const seq = ++searchSeq.current
      if (v.trim().length < 2) {
        setSearchResults([])
        setSearchOpen(false)
        return
      }
      setSearchOpen(true)
      runSearch(v, staticIndexRef.current, actions).then((res) => {
        if (seq !== searchSeq.current) return
        const wrapped = res.map((r) => ({
          ...r,
          go: () => {
            r.go()
            setSearchOpen(false)
            setSearchQ(r.label)
          },
        }))
        setSearchResults(wrapped)
      })
    },
    [actions],
  )

  // --- Fiche model ---
  const ficheModel = useMemo(() => {
    if (!ficheRef) return null
    return buildFicheModel(
      ficheRef,
      { regionNames, depNames, communeMedia, depAgg },
      actions,
    )
  }, [ficheRef, regionNames, depNames, communeMedia, depAgg, actions])

  // Réinitialise la synthèse IA quand on change d'entité affichée
  useEffect(() => {
    aiAbort.current?.abort()
    setAi({ status: 'idle' })
  }, [ficheRef])

  // Échap : ferme le modal puis la fiche (retour à la carte)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (settingsOpen) setSettingsOpen(false)
      else if (ficheRef) closeFiche()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [settingsOpen, ficheRef, closeFiche])

  const onSummarize = useCallback(() => {
    if (!ficheModel) return
    if (!settings.apiKey || !settings.selectedModel) {
      setAi({ status: 'error', error: 'Aucune clé OpenRouter ou modèle sélectionné.' })
      setSettingsOpen(true)
      return
    }
    const seq = ++aiSeq.current
    const controller = new AbortController()
    aiAbort.current = controller
    setAi({ status: 'loading' })
    summarizeFiche({
      apiKey: settings.apiKey,
      model: settings.selectedModel,
      prompt: buildFichePrompt(ficheModel),
      signal: controller.signal,
    })
      .then((text) => {
        if (seq === aiSeq.current) setAi({ status: 'done', text })
      })
      .catch((err: Error) => {
        if (seq === aiSeq.current && err.name !== 'AbortError')
          setAi({ status: 'error', error: 'Échec de la génération : ' + err.message })
      })
  }, [ficheModel, settings.apiKey, settings.selectedModel])

  // --- Crumbs + hint ---
  const crumbs: Crumb[] = useMemo(() => {
    const list: Crumb[] = [
      { label: 'France', active: !regionSel, go: () => actions.resetFrance() },
    ]
    if (regionSel) {
      list.push({
        label: regionNames.get(regionSel) ?? regionSel,
        active: !depSel,
        go: () => actions.selectRegion(regionSel),
      })
    }
    if (depSel) {
      list.push({ label: depNames.get(depSel) ?? depSel, active: true, go: () => {} })
    }
    return list
  }, [regionSel, depSel, regionNames, depNames, actions])

  const hint = depSel
    ? 'Cliquez sur les marqueurs de villes pour ouvrir une fiche commune.'
    : regionSel
      ? 'Cliquez sur un département pour ouvrir sa fiche et zoomer.'
      : 'Cliquez sur une région pour zoomer et afficher ses départements.'

  const themeMetric = tab === 'theme' ? metric : null
  const legend = tab === 'theme' ? buildThemeScale(metric).legend : null

  const toggleSide = useCallback(() => {
    setSideDisplay((d) => (d === 'none' ? 'flex' : 'none'))
    mapRef.current?.invalidateSize()
  }, [])

  return (
    <div
      className="gf-app"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#f5f4f0',
      }}
    >
      <Header
        tab={tab}
        searchQ={searchQ}
        searchResults={searchResults}
        searchOpen={searchOpen}
        onSearchChange={onSearchChange}
        onSearchFocus={() => {
          if (searchResults.length) setSearchOpen(true)
        }}
        onSearchClose={() => setSearchOpen(false)}
        onTab={onTab}
        onBurger={toggleSide}
        onReset={() => actions.resetFrance()}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {settingsOpen && (
        <SettingsModal
          apiKey={settings.apiKey}
          selectedModel={settings.selectedModel}
          freeModels={settings.freeModels}
          modelsLoading={settings.modelsLoading}
          modelsError={settings.modelsError}
          onLoadModels={settings.loadFreeModels}
          onSave={(k, m) => {
            settings.save(k, m)
            setSettingsOpen(false)
          }}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>
        <Sidebar
          tab={tab}
          display={sideDisplay}
          layers={layers}
          onToggleLayer={onToggleLayer}
          base={base}
          onSetBase={onSetBase}
          metric={metric}
          onSetMetric={setMetric}
          crumbs={crumbs}
          hint={hint}
          actions={actions}
        />

        <main style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <MapView
            ref={mapRef}
            actions={actions}
            depRegionMap={depRegionMap}
            layers={layers}
            base={base}
            themeMetric={themeMetric}
            selectedDep={depSel}
            onReady={() => setLoading(false)}
            onRegionFeatureClick={onRegionFeatureClick}
            onDepFeatureClick={onDepFeatureClick}
            onVilleClick={onVilleClick}
            onMapClick={onMapClick}
          />

          {loading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#eef0ee',
                zIndex: 500,
              }}
            >
              <div style={{ textAlign: 'center', color: 'rgba(34,38,42,0.6)' }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    border: '3px solid rgba(47,93,138,0.25)',
                    borderTopColor: '#2f5d8a',
                    borderRadius: '50%',
                    margin: '0 auto 12px',
                    animation: 'gfSpin 0.9s linear infinite',
                  }}
                />
                <div style={{ fontSize: 13, fontWeight: 600 }}>Chargement de la carte…</div>
              </div>
            </div>
          )}

          {legend && tab === 'theme' && <Legend legend={legend} />}
          {tab !== 'theme' && <MapLegend layers={layers} depSelected={!!depSel} />}
        </main>

        {ficheModel && (
          <Fiche
            model={ficheModel}
            ai={{ canUse: aiCanUse, ...ai }}
            onSummarize={onSummarize}
            onOpenSettings={() => setSettingsOpen(true)}
            onClose={closeFiche}
            onViewSat={() => setBase('sat')}
            onViewTopo={() => setBase('topo')}
          />
        )}
      </div>
    </div>
  )
}
