'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { MapPin, Star, Search, Map as MapIcon, ChevronDown, Check, X } from 'lucide-react'
import { AVATAR_COLORS, TYPE_LABEL } from '@/lib/constants'
import { 
  APIProvider, 
  Map, 
  InfoWindow, 
  useMap,
} from '@vis.gl/react-google-maps'

type Pro = {
  id: string; name: string; city: string; address: string
  initials: string; color: string; desc: string
  rating: number; reviews: number; response: string
  verified: boolean; type: string; typeLabel: string
  lat: number; lng: number
}

interface ProfessionalsClientProps {
  initialPros: Pro[]
  initialType?: string
  initialLocation?: string
}


export default function ProfessionalsClient({ initialPros, initialType, initialLocation }: ProfessionalsClientProps) {
  const [allPros] = useState<Pro[]>(initialPros)
  const [search, setSearch]     = useState(initialLocation || '')
  const [typeFilter, setTypeFilter] = useState<string[]>(initialType ? [initialType] : [])
  const [minRating, setMinRating]   = useState('all')
  const [sort, setSort]         = useState('name')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [selectedPro, setSelectedPro] = useState<Pro | null>(null)
  const [mapCenter, setMapCenter] = useState({ lat: 46.2276, lng: 2.2137 })
  const [mapZoom, setMapZoom] = useState(6)
  const isProgrammatic = useMemo(() => ({ current: false }), [])

  // Sync state with props when navigating
  useEffect(() => {
    setSearch(initialLocation || '')
    setTypeFilter(initialType ? [initialType] : [])
  }, [initialType, initialLocation])

  const filtered = useMemo(() => {
    let list = [...allPros]
    if (typeFilter.length > 0) list = list.filter(p => typeFilter.includes(p.type))
    if (minRating !== 'all') list = list.filter(p => p.rating >= parseFloat(minRating))
    if (search) {
      const s = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.city.toLowerCase().includes(s)
      )
    }
    list.sort((a, b) => {
      if (sort === 'rating')    return b.rating - a.rating
      if (sort === 'reviews')   return b.reviews - a.reviews
      if (sort === 'response')  return (parseInt(a.response) || 99) - (parseInt(b.response) || 99)
      return a.name.localeCompare(b.name)
    })
    return list
  }, [allPros, typeFilter, minRating, search, sort])

  return (
    <div className="fade-in" style={{ background: '#F9FAFB' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ background: 'var(--black)', padding: '80px 32px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', fontSize: 56, marginBottom: 16, fontFamily: 'var(--font-serif)', fontWeight: 700 }}>Trouvez un professionnel certifié</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>Tous les professionnels vérifiés dans notre base. Certifications contrôlées, avis authentiques.</p>
      </section>

      <div style={{ maxWidth: 1200, margin: '48px auto', padding: '0 32px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32 }}>
        
        {/* Sidebar Filters */}
        <aside>
          <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 8, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Filtres</span>
              <button 
                onClick={() => {
                  setTypeFilter([])
                  setMinRating('all')
                  setSearch('')
                }}
                style={{ color: 'var(--gray-400)', fontSize: 11, fontWeight: 700, background: 'none', border: '1px solid var(--gray-200)', padding: '4px 12px', borderRadius: 4, cursor: 'pointer' }}
              >
                Réinitialiser
              </button>
            </div>

            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--gray-400)', letterSpacing: 0.5, marginBottom: 16 }}>TYPE DE PROFESSIONNEL</div>
              {Object.entries(TYPE_LABEL).map(([key, label]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={typeFilter.includes(key)} onChange={e => setTypeFilter(prev => e.target.checked ? [...prev, key] : prev.filter(t => t !== key))} />
                  {label}
                </label>
              ))}
            </div>

            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--gray-400)', letterSpacing: 0.5, marginBottom: 16 }}>NOTE MINIMALE</div>
              {[{ id: 'all', label: 'Toutes' }, { id: '4.5', label: '4,5+' }, { id: '4', label: '4+' }, { id: '3', label: '3+' }].map(n => (
                <label key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 13, cursor: 'pointer' }}>
                  <input type="radio" name="note" checked={minRating === n.id} onChange={() => setMinRating(n.id)} />
                  {n.label}
                </label>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--gray-400)', letterSpacing: 0.5, marginBottom: 16 }}>TRIER PAR</div>
              <div style={{ position: 'relative' }}>
                <select value={sort} onChange={e => setSort(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 13, appearance: 'none' }}>
                  <option value="name">Nom A → Z</option>
                  <option value="rating">Meilleure note</option>
                  <option value="reviews">Plus d'avis</option>
                  <option value="response">Réactivité</option>
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{`${filtered.length} professionnel${filtered.length > 1 ? 's' : ''} correspondent à votre recherche`}</div>
            <button 
              onClick={() => setViewMode(m => m === 'list' ? 'map' : 'list')} 
              className={viewMode === 'map' ? 'btn btn-red' : 'btn btn-outline'} 
              style={{ padding: '10px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, textTransform: 'none', transition: 'all 0.2s' }}
            >
              <MapIcon size={16} /> {viewMode === 'list' ? 'Vue carte' : 'Vue liste'}
            </button>
          </div>

          <div style={{ marginBottom: 32, position: 'relative' }}>
            <Search size={18} color="var(--black)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.7 }} />
            <input 
              type="text" 
              placeholder="Chercher par ville ou code postal..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              style={{ 
                width: '100%', 
                padding: '16px 20px 16px 52px', 
                borderRadius: 12, 
                border: '2px solid var(--gray-200)', 
                fontSize: 15, 
                outline: 'none', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                transition: 'all 0.2s',
                background: 'white'
              }} 
              onFocus={e => e.currentTarget.style.borderColor = 'var(--black)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--gray-200)'}
            />
          </div>

          {viewMode === 'list' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filtered.length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center', background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Aucun résultat</div>
                  <p style={{ color: 'var(--gray-400)', fontSize: 14, margin: 0 }}>Essayez de modifier vos filtres ou d'élargir votre zone de recherche.</p>
                </div>
              ) : filtered.map(pro => (
                <ProCard key={pro.id} pro={pro} />
              ))}
            </div>
          ) : (
            <div style={{ height: 600, width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--gray-200)', position: 'relative' }}>
              <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''}>
                <Map
                  style={{ width: '100%', height: '100%' }}
                  defaultCenter={{ lat: 46.2276, lng: 2.2137 }}
                  defaultZoom={6}
                  gestureHandling={'greedy'}
                  disableDefaultUI={false}
                  onDragstart={() => setSelectedPro(null)}
                  onZoomChanged={() => {
                    if (!isProgrammatic.current) {
                      setSelectedPro(null)
                    }
                  }}
                  styles={[
                    { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
                    { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
                    { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
                    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
                    { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "visibility": "off" }] },
                    { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{ "visibility": "off" }] },
                    { "featureType": "administrative.province", "elementType": "geometry.stroke", "stylers": [{ "visibility": "off" }] },
                    { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
                    { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
                    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
                    { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
                    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
                    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dadada" }] },
                    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#d9d9d9" }] }
                  ]}
                >
                  <MapMarkers 
                    pros={filtered} 
                    onSelect={setSelectedPro} 
                    selectedId={selectedPro?.id}
                    isProgrammatic={isProgrammatic} 
                  />
                          {selectedPro && (
                      <InfoWindow
                        position={{ lat: selectedPro.lat, lng: selectedPro.lng }}
                        onCloseClick={() => setSelectedPro(null)}
                        headerDisabled={true}
                        pixelOffset={[0, -45]}
                      >
                        <div style={{ minWidth: 240, padding: '16px 8px 8px 8px' }}>
                          <div style={{ fontSize: 10, fontWeight: 900, color: '#C0392B', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>{selectedPro.typeLabel}</div>
                          <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6, color: 'var(--black)', fontFamily: 'var(--font-serif)' }}>{selectedPro.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--gray-500)', marginBottom: 20 }}>
                            <MapPin size={14} color="var(--gray-400)" /> {selectedPro.city}
                          </div>
                          <Link 
                            href={`/professionnels/${selectedPro.id}`}
                            style={{ 
                              display: 'block',
                              textAlign: 'center',
                              background: 'var(--black)',
                              color: 'white',
                              padding: '12px 16px',
                              borderRadius: 8,
                              fontSize: 13, 
                              fontWeight: 700, 
                              textDecoration: 'none',
                              transition: 'opacity 0.2s'
                            }}
                          >
                            Consulter le profil
                          </Link>
                        </div>
                      </InfoWindow>
                    )}
                </Map>
              </APIProvider>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  )
}

function ProCard({ pro }: { pro: Pro }) {
  return (
    <div key={pro.id} className="card" style={{ padding: 32, display: 'grid', gridTemplateColumns: '64px 1fr', gap: 24, position: 'relative' }}>
      <div style={{ width: 64, height: 64, borderRadius: 8, background: pro.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800 }}>
        {pro.initials}
      </div>
      
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <h3 style={{ fontSize: 18, fontFamily: 'var(--font-body)', fontWeight: 700 }}>{pro.name}</h3>
          {pro.verified && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669', fontSize: 11, fontWeight: 800 }}>
              <Check size={14} /> VÉRIFIÉ
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--gray-400)', marginBottom: 16 }}>
          <MapPin size={14} /> {pro.address}, {pro.city}
        </div>
        
        <div style={{ fontSize: 12, fontWeight: 700, color: '#C0392B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {pro.typeLabel}
        </div>

        <p style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.6, marginBottom: 24, maxWidth: '80%' }}>
          {pro.desc}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--gray-100)', paddingTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={pro.rating >= s ? "#F5A623" : "none"} color={pro.rating >= s ? "#F5A623" : "#D1D5DB"} />)}
              </div>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{pro.rating === 0 ? '0' : pro.rating}</span>
              <span style={{ color: 'var(--gray-400)', fontSize: 13 }}>({pro.reviews} avis)</span>
            </div>
            <div style={{ width: 1, height: 16, background: 'var(--gray-200)' }} />
            <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>
              Répond sous <span style={{ fontWeight: 700, color: 'var(--black)' }}>{pro.response}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <Link href={`/professionnels/${pro.id}`} className="btn btn-outline btn-sm">Voir le profil</Link>
            <Link href="/formulaire" className="btn btn-red btn-sm">Demander un devis</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function MapMarkers({ pros, onSelect, selectedId, isProgrammatic }: { pros: Pro[], onSelect: (p: Pro) => void, selectedId?: string, isProgrammatic: { current: boolean } }) {
  const map = useMap()
  
  return (
    <>
      {pros.map(pro => (
        <LegacyMarker
          key={pro.id}
          pro={pro}
          isSelected={pro.id === selectedId}
          onClick={() => {
            isProgrammatic.current = true
            onSelect(pro)
            if (map) {
              const targetZoom = 14
              const currentZoom = map.getZoom() || 6
              
              // Smoothly animate zoom and pan
              map.panTo({ lat: pro.lat, lng: pro.lng })
              
              const animateZoom = (current: number, target: number) => {
                if (current === target) return
                const step = target > current ? 1 : -1
                setTimeout(() => {
                  map.setZoom(current + step)
                  animateZoom(current + step, target)
                }, 120) // Slightly slower for more "organic" feel
              }
              
              setTimeout(() => {
                animateZoom(currentZoom, targetZoom)
              }, 400) // Start zooming after the pan has begun
            }
            setTimeout(() => {
              isProgrammatic.current = false
            }, 1500)
          }}
        />
      ))}
    </>
  )
}

function LegacyMarker({ pro, onClick, isSelected }: { pro: Pro, onClick: () => void, isSelected?: boolean }) {
  const map = useMap()
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)

  useEffect(() => {
    if (!map) return

    const color = isSelected ? '#C0392B' : 'black'
    const zIndex = isSelected ? 1000 : 1

    const m = new google.maps.Marker({
      map,
      position: { lat: pro.lat, lng: pro.lng },
      zIndex,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.16344 0 0 7.16344 0 16C0 28 16 40 16 40C16 40 32 28 32 16C32 7.16344 24.8366 0 16 0Z" fill="${color}"/>
            <circle cx="16" cy="16" r="5" fill="white"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(32, 40),
        anchor: new google.maps.Point(16, 40)
      }
    })

    m.addListener('click', () => {
      onClick()
    })

    setMarker(m)

    return () => {
      m.setMap(null)
    }
  }, [map, pro, onClick, isSelected])

  return null
}
