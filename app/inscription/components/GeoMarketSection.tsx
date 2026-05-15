'use client'

import CustomSelect from '@/components/ui/CustomSelect'
import CustomMultiSelect from '@/components/ui/CustomMultiSelect'

const SANS = 'var(--font-sans, DM Sans, sans-serif)'
const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 7, fontFamily: SANS }

const GEO_OPTIONS = [
  { id: 'international', label: 'International' },
  { id: 'national',      label: 'France entière (National)' },
  { id: 'region',        label: 'Par Région' },
  { id: 'department',    label: 'Par Département' },
]

const MARKET_OPTIONS = ['Marché public', 'Marché privé', 'Particulier'] as const

type Props = {
  geoScope: string
  setGeoScope: (v: 'international' | 'national' | 'region' | 'department' | '') => void
  selectedGeo: string[]
  setSelectedGeo: (v: string[]) => void
  regions: { code: string; label: string; id: string }[]
  departments: { code: string; label: string; id: string }[]
  selectedMarkets: string[]
  setSelectedMarkets: (v: string[]) => void
  toggle: (list: string[], set: (v: string[]) => void, item: string) => void
}

export default function GeoMarketSection({
  geoScope, setGeoScope, selectedGeo, setSelectedGeo,
  regions, departments, selectedMarkets, setSelectedMarkets, toggle,
}: Props) {
  return (
    <>
      <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', letterSpacing: '0.8px', fontFamily: SANS, marginBottom: 20, textTransform: 'uppercase' }}>
          ZONE GÉOGRAPHIQUE D'INTERVENTION
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ ...lbl, fontSize: 14, marginBottom: 8 }}>Couverture géographique</label>
            <CustomSelect
              options={GEO_OPTIONS}
              value={geoScope}
              onChange={v => { setGeoScope(v as any); setSelectedGeo([]) }}
              placeholder="Choisir l'échelle d'intervention..."
            />
          </div>
          {geoScope === 'region' && (
            <div className="fade-in">
              <label style={{ ...lbl, fontSize: 14, marginBottom: 8 }}>Sélectionner la région</label>
              <CustomMultiSelect
                options={regions.map(r => ({ id: r.code, label: r.label }))}
                value={selectedGeo}
                onChange={setSelectedGeo}
                placeholder="Choisir une ou plusieurs régions..."
              />
            </div>
          )}
          {geoScope === 'department' && (
            <div className="fade-in">
              <label style={{ ...lbl, fontSize: 14, marginBottom: 8 }}>Sélectionner le département</label>
              <CustomMultiSelect
                options={departments.map(d => ({ id: d.code, label: `${d.code} - ${d.label}` }))}
                value={selectedGeo}
                onChange={setSelectedGeo}
                placeholder="Choisir un ou plusieurs départements..."
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <label style={lbl}>Marchés couverts</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MARKET_OPTIONS.map(m => (
            <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
              <input
                type="checkbox"
                style={{ accentColor: 'var(--red)' }}
                checked={selectedMarkets.includes(m)}
                onChange={() => toggle(selectedMarkets, setSelectedMarkets, m)}
              />
              {m}
            </label>
          ))}
        </div>
      </div>
    </>
  )
}
