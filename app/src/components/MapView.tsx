import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import L from 'leaflet'
import { communeLatLng } from '../api/geo'
import { fmt } from '../lib/format'
import { buildThemeScale } from '../lib/theme'
import {
  VILLES,
  PREFECTURES,
  FLEUVES,
  SOMMETS,
  PARCS,
  LACS,
} from '../data/editorial'
import type { ApiCommune, BaseMap, LayerKey, LayerState, MetricKey } from '../types'
import type { NavActions } from '../state/actions'

export interface MapHandle {
  focusRegion: (codeRegion: string) => void
  focusDep: (codeDep: string) => void
  setCommuneMarkers: (list: ApiCommune[]) => void
  clearCommuneMarkers: () => void
  flyTo: (latlng: [number, number], zoom: number) => void
  fitFrance: () => void
  clearDepLayer: () => void
  invalidateSize: () => void
}

interface Props {
  actions: NavActions
  depRegionMap: Map<string, string>
  layers: LayerState
  base: BaseMap
  themeMetric: MetricKey | null // non-null => choroplèthe active
  selectedDep: string | null
  onReady: () => void
  onRegionFeatureClick: (code: string) => void
  onDepFeatureClick: (code: string) => void
  onVilleClick: (nom: string, lat: number, lng: number, pop: number) => void
  onMapClick: () => void
}

const TILES: Record<BaseMap, { url: string; attribution: string; maxZoom: number }> = {
  plan: {
    // Plan IGN v2 (Géoplateforme) : cartographie officielle française, libellés
    // 100 % en français (contrairement à CARTO qui nomme les pays/mers en anglais).
    url: 'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&TILEMATRIXSET=PM&FORMAT=image/png&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
    attribution: '© IGN · Géoplateforme',
    maxZoom: 19,
  },
  topo: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap · © OpenTopoMap (CC-BY-SA)',
    maxZoom: 17,
  },
  sat: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri — Maxar, Earthstar Geographics',
    maxZoom: 19,
  },
}

// Le remplissage vectoriel s'adapte au fond de carte : opaque sur le plan clair
// (comme prévu au design), transparent sur satellite et léger sur topo pour
// laisser voir l'imagerie/le relief au lieu de « griser » toute la France.
function regionFillOpacity(base: BaseMap): number {
  // Plan & satellite : aucun remplissage (seulement le contour), pour ne rien
  // masquer du fond de carte. Topo : teinte très légère (le relief reste lisible).
  return base === 'topo' ? 0.1 : 0
}
function regionStyle(base: BaseMap): L.PathOptions {
  return { color: '#7d97ab', weight: 1.2, fillColor: '#dfe8ef', fillOpacity: regionFillOpacity(base) }
}
function depFillOpacity(base: BaseMap, selected: boolean): number {
  // Non sélectionné : pas de remplissage (contour seul). Sélectionné : surligné
  // pour rester bien identifiable quel que soit le fond.
  if (selected) return base === 'sat' ? 0.3 : base === 'topo' ? 0.35 : 0.45
  return base === 'topo' ? 0.08 : 0
}
function depStyle(base: BaseMap, selected: boolean): L.PathOptions {
  return {
    color: '#5c7d99',
    weight: 1,
    fillColor: selected ? '#f3d9b0' : '#ffffff',
    fillOpacity: depFillOpacity(base, selected),
  }
}

const MapView = forwardRef<MapHandle, Props>(function MapView(props, ref) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const tileRef = useRef<L.TileLayer | null>(null)
  const regionLayerRef = useRef<L.GeoJSON | null>(null)
  const depLayerRef = useRef<L.GeoJSON | null>(null)
  const depGeoRef = useRef<GeoJSON.FeatureCollection | null>(null)
  const communeLayerRef = useRef<L.LayerGroup | null>(null)
  const overlaysRef = useRef<Partial<Record<LayerKey, L.LayerGroup>>>({})

  // Refs « live » pour que les handlers Leaflet (liés une seule fois) lisent l'état courant.
  const propsRef = useRef(props)
  propsRef.current = props

  // ---------- Init ----------
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, {
      zoomControl: false,
      zoomSnap: 0.25,
      attributionControl: true,
    })
    map.attributionControl.setPrefix(false)
    L.control.zoom({ position: 'topright' }).addTo(map)
    map.setView([46.5, 2.6], 6)
    // Tout tap sur la carte (zone vide ou entité) notifie App (ferme la sidebar en mobile)
    map.on('click', () => propsRef.current.onMapClick())
    mapRef.current = map

    setTile(props.base)
    buildOverlays()

    // GeoJSON régions + départements
    Promise.all([
      fetch('/geo/regions.geojson').then((r) => r.json()),
      fetch('/geo/departements.geojson').then((r) => r.json()),
    ])
      .then(([rg, dp]: [GeoJSON.FeatureCollection, GeoJSON.FeatureCollection]) => {
        depGeoRef.current = dp
        regionLayerRef.current = L.geoJSON(rg, {
          style: () => regionStyle(propsRef.current.base),
          onEachFeature: (f, ly) => {
            const code = (f.properties as { code: string }).code
            const nom = (f.properties as { nom: string }).nom
            ly.bindTooltip(nom, { sticky: true })
            ly.on('mouseover', () => {
              if (!propsRef.current.themeMetric) (ly as L.Path).setStyle({ fillColor: '#cfdde9', fillOpacity: 0.35 })
            })
            ly.on('mouseout', () => {
              if (!propsRef.current.themeMetric) (ly as L.Path).setStyle(regionStyle(propsRef.current.base))
            })
            ly.on('click', () => propsRef.current.onRegionFeatureClick(code))
          },
        }).addTo(map)
        applyChoropleth(props.themeMetric)
        props.onReady()
      })
      .catch(() => props.onReady())

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------- Sync base tiles + style vecteur dépendant du fond ----------
  useEffect(() => {
    setTile(props.base)
    if (regionLayerRef.current && !props.themeMetric) {
      regionLayerRef.current.setStyle(() => regionStyle(props.base))
    }
    restyleDeps(props.base)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.base])

  // ---------- Sync overlays visibility ----------
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    ;(Object.keys(props.layers) as LayerKey[]).forEach((k) => {
      const grp = overlaysRef.current[k]
      if (!grp) return
      const on = props.layers[k]
      if (on && !map.hasLayer(grp)) grp.addTo(map)
      if (!on && map.hasLayer(grp)) map.removeLayer(grp)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.layers])

  // ---------- Sync choropleth ----------
  useEffect(() => {
    applyChoropleth(props.themeMetric)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.themeMetric])

  // ---------- Helpers ----------
  function setTile(base: BaseMap) {
    const map = mapRef.current
    if (!map) return
    if (tileRef.current) map.removeLayer(tileRef.current)
    const t = TILES[base] ?? TILES.plan
    tileRef.current = L.tileLayer(t.url, { attribution: t.attribution, maxZoom: t.maxZoom }).addTo(map)
    // le fond doit rester sous les vecteurs
    tileRef.current.bringToBack()
  }

  function buildOverlays() {
    const map = mapRef.current!
    const ov = overlaysRef.current

    ov.villes = L.layerGroup(
      VILLES.map((v) =>
        L.circleMarker([v[1], v[2]], {
          radius: 4 + Math.sqrt(v[3]) / 260,
          color: '#2f5d8a',
          weight: 1.5,
          fillColor: '#2f5d8a',
          fillOpacity: 0.25,
        })
          .bindTooltip(v[0] + ' — ' + fmt(v[3]) + ' hab.')
          .on('click', () => propsRef.current.onVilleClick(v[0], v[1], v[2], v[3])),
      ),
    )

    ov.prefs = L.layerGroup(
      PREFECTURES.map((d) =>
        L.circleMarker([d[2], d[3]], {
          radius: 3.5,
          color: '#6b4a2e',
          weight: 1.5,
          fillColor: '#fff',
          fillOpacity: 1,
        })
          .bindTooltip(d[1] + ' — préfecture (' + d[0] + ')')
          .on('click', () => propsRef.current.onDepFeatureClick(d[0])),
      ),
    )

    ov.fleuves = L.layerGroup(
      FLEUVES.map((fl) =>
        L.polyline(fl.pts, { color: '#4f86b8', weight: 2.5, opacity: 0.9 })
          .bindTooltip(fl.nom + ' · ' + fl.longueur, { sticky: true })
          .on('click', () =>
            propsRef.current.actions.openLieu(
              'Fleuve',
              fl.nom,
              fl.longueur + ' · tracé simplifié',
              fl.pts[Math.floor(fl.pts.length / 2)],
              null,
              [['Longueur', fl.longueur], ['Tracé', 'simplifié (démonstration)']],
            ),
          ),
      ),
    )

    ov.sommets = L.layerGroup(
      SOMMETS.map((s) =>
        L.marker([s[1], s[2]], {
          icon: L.divIcon({
            className: '',
            html: '<div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:11px solid #6b4a2e;"></div>',
            iconSize: [12, 11],
            iconAnchor: [6, 11],
          }),
        })
          .bindTooltip(s[0] + ' · ' + fmt(s[3]) + ' m')
          .on('click', () =>
            propsRef.current.actions.openLieu('Sommet', s[0], s[4], [s[1], s[2]], 11, [
              ['Altitude', fmt(s[3]) + ' m'],
              ['Massif', s[4]],
            ]),
          ),
      ),
    )

    ov.parcs = L.layerGroup(
      PARCS.map((p) =>
        L.circleMarker([p[1], p[2]], {
          radius: 6,
          color: '#4e7a5a',
          weight: 1.5,
          fillColor: '#4e7a5a',
          fillOpacity: 0.3,
        })
          .bindTooltip(p[0])
          .on('click', () =>
            propsRef.current.actions.openLieu('Parc naturel', p[0], p[3], [p[1], p[2]], 9, [
              ['Statut', p[3]],
            ]),
          ),
      ),
    )

    ov.lacs = L.layerGroup(
      LACS.map((lc) =>
        L.circleMarker([lc[1], lc[2]], {
          radius: 5,
          color: '#3b7ea1',
          weight: 1.5,
          fillColor: '#3b7ea1',
          fillOpacity: 0.4,
        })
          .bindTooltip(lc[0])
          .on('click', () =>
            propsRef.current.actions.openLieu('Lac', lc[0], lc[3], [lc[1], lc[2]], 10, [
              ['Caractéristiques', lc[3]],
            ]),
          ),
      ),
    )

    // Ajoute les calques initialement actifs
    ;(Object.keys(propsRef.current.layers) as LayerKey[]).forEach((k) => {
      if (propsRef.current.layers[k] && ov[k]) ov[k]!.addTo(map)
    })
  }

  function applyChoropleth(metric: MetricKey | null) {
    const layer = regionLayerRef.current
    if (!layer) return
    if (!metric) {
      layer.setStyle(() => regionStyle(propsRef.current.base))
      return
    }
    const scale = buildThemeScale(metric)
    layer.setStyle((f) => ({
      color: '#ffffff',
      weight: 1.2,
      fillColor: scale.colorForCode(((f as GeoJSON.Feature).properties as { code: string }).code),
      fillOpacity: 0.85,
    }))
  }

  function drawDepLayer(codeRegion: string) {
    const map = mapRef.current!
    const geo = depGeoRef.current
    if (!geo) return
    if (depLayerRef.current) map.removeLayer(depLayerRef.current)
    const depReg = propsRef.current.depRegionMap
    depLayerRef.current = L.geoJSON(geo, {
      filter: (f) => depReg.get((f.properties as { code: string }).code) === codeRegion,
      style: () => depStyle(propsRef.current.base, false),
      onEachFeature: (f, ly) => {
        const code = (f.properties as { code: string }).code
        const nom = (f.properties as { nom: string }).nom
        ly.bindTooltip(code + ' · ' + nom, { sticky: true })
        ly.on('mouseover', () =>
          (ly as L.Path).setStyle({ fillColor: '#e8eef3', fillOpacity: 0.5 }),
        )
        ly.on('mouseout', () =>
          (ly as L.Path).setStyle(depStyle(propsRef.current.base, propsRef.current.selectedDep === code)),
        )
        ly.on('click', () => propsRef.current.onDepFeatureClick(code))
      },
    }).addTo(map)
  }

  function styleSelectedDep(code: string) {
    const base = propsRef.current.base
    depLayerRef.current?.eachLayer((l2) => {
      const c = (((l2 as L.GeoJSON).feature as GeoJSON.Feature).properties as { code: string }).code
      ;(l2 as L.Path).setStyle(depStyle(base, c === code))
    })
  }

  // Ré-applique le style des départements pour le fond de carte courant
  function restyleDeps(base: BaseMap) {
    const sel = propsRef.current.selectedDep
    depLayerRef.current?.eachLayer((l2) => {
      const c = (((l2 as L.GeoJSON).feature as GeoJSON.Feature).properties as { code: string }).code
      ;(l2 as L.Path).setStyle(depStyle(base, c === sel))
    })
  }

  // ---------- Imperative API ----------
  useImperativeHandle(ref, (): MapHandle => ({
    focusRegion(codeRegion) {
      const map = mapRef.current
      if (!map) return
      drawDepLayer(codeRegion)
      try {
        const b = depLayerRef.current?.getBounds()
        if (b && b.isValid()) map.fitBounds(b, { padding: [24, 24] })
      } catch {
        /* bounds indisponibles */
      }
    },
    focusDep(codeDep) {
      const map = mapRef.current
      if (!map) return
      styleSelectedDep(codeDep)
      let done = false
      depLayerRef.current?.eachLayer((l2) => {
        const c = (((l2 as L.GeoJSON).feature as GeoJSON.Feature).properties as { code: string }).code
        if (c === codeDep) {
          try {
            map.fitBounds((l2 as L.GeoJSON).getBounds(), { padding: [40, 40] })
            done = true
          } catch {
            /* ignore */
          }
        }
      })
      if (!done) {
        const p = PREFECTURES.find((x) => x[0] === codeDep)
        if (p) map.flyTo([p[2], p[3]], 9)
      }
    },
    setCommuneMarkers(list) {
      const map = mapRef.current
      if (!map) return
      if (communeLayerRef.current) map.removeLayer(communeLayerRef.current)
      const markers = list
        .map((c) => {
          const ll = communeLatLng(c)
          if (!ll) return null
          const pop = c.population ?? 0
          return L.circleMarker(ll, {
            radius: 3 + Math.sqrt(pop) / 260,
            color: '#4e7a5a',
            weight: 1.4,
            fillColor: '#4e7a5a',
            fillOpacity: 0.3,
          })
            .bindTooltip(c.nom + (pop ? ' — ' + fmt(pop) + ' hab.' : ''))
            .on('click', () => propsRef.current.actions.openCommune(c))
        })
        .filter((m): m is L.CircleMarker => m !== null)
      communeLayerRef.current = L.layerGroup(markers).addTo(map)
    },
    clearCommuneMarkers() {
      const map = mapRef.current
      if (map && communeLayerRef.current) {
        map.removeLayer(communeLayerRef.current)
        communeLayerRef.current = null
      }
    },
    flyTo(latlng, zoom) {
      mapRef.current?.flyTo(latlng, zoom)
    },
    fitFrance() {
      const map = mapRef.current
      const layer = regionLayerRef.current
      if (map && layer) {
        try {
          map.fitBounds(layer.getBounds(), { padding: [20, 20] })
        } catch {
          map.setView([46.5, 2.6], 6)
        }
      }
    },
    clearDepLayer() {
      const map = mapRef.current
      if (map && depLayerRef.current) {
        map.removeLayer(depLayerRef.current)
        depLayerRef.current = null
      }
    },
    invalidateSize() {
      setTimeout(() => mapRef.current?.invalidateSize(), 60)
    },
  }))

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
})

export default MapView
