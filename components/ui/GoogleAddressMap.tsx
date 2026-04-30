'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { MapPin } from 'lucide-react'

type AddressResult = {
  formatted: string
  street: string
  city: string
  postalCode: string
  department: string
  lat: number
  lng: number
}

type Props = {
  onSelect: (result: AddressResult) => void
  searchValue: string
  onSearchChange: (value: string) => void
}

declare global {
  interface Window {
    google: typeof google
    initGoogleMaps: () => void
  }
}

export default function GoogleAddressMap({ onSelect, searchValue, onSearchChange }: Props) {
  const inputRef  = useRef<HTMLInputElement>(null)
  const mapRef    = useRef<HTMLDivElement>(null)
  const mapObj    = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

  function initMaps() {
    setLoaded(true)
  }

  useEffect(() => {
    if (!loaded || !inputRef.current || !window.google) return

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'fr' },
      fields: ['address_components', 'formatted_address', 'geometry'],
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place.geometry?.location) return

      const components = place.address_components ?? []
      const get = (type: string) =>
        components.find((c: google.maps.GeocoderAddressComponent) => c.types.includes(type))?.long_name ?? ''
      const getShort = (type: string) =>
        components.find((c: google.maps.GeocoderAddressComponent) => c.types.includes(type))?.short_name ?? ''

      const streetNumber = get('street_number')
      const route        = get('route')
      const city         = get('locality') || get('postal_town')
      const postalCode   = getShort('postal_code')
      const department   = getShort('administrative_area_level_2')
      const lat          = place.geometry.location.lat()
      const lng          = place.geometry.location.lng()

      const result: AddressResult = {
        formatted:   place.formatted_address ?? '',
        street:      [streetNumber, route].filter(Boolean).join(' '),
        city, postalCode, department, lat, lng,
      }

      onSelect(result)
      onSearchChange(place.formatted_address ?? '')
      setCoords({ lat, lng })
    })
  }, [loaded])

  // Styles niveaux de gris
  const grayscaleStyles: google.maps.MapTypeStyle[] = [
    { elementType: 'geometry',            stylers: [{ saturation: -100 }] },
    { elementType: 'labels.text.fill',    stylers: [{ color: '#555' }] },
    { elementType: 'labels.text.stroke',  stylers: [{ color: '#f5f5f5' }] },
    { featureType: 'poi',                 stylers: [{ visibility: 'off' }] },
    { featureType: 'transit',             stylers: [{ visibility: 'off' }] },
    { featureType: 'road',                elementType: 'geometry', stylers: [{ color: '#e0e0e0' }] },
    { featureType: 'road.arterial',       elementType: 'geometry', stylers: [{ color: '#d6d6d6' }] },
    { featureType: 'road.highway',        elementType: 'geometry', stylers: [{ color: '#c8c8c8' }] },
    { featureType: 'water',               elementType: 'geometry', stylers: [{ color: '#c9d6e0' }] },
  ]

  // Init carte + animation zoom au changement d'adresse
  useEffect(() => {
    if (!loaded || !coords || !mapRef.current || !window.google) return

    if (!mapObj.current) {
      mapObj.current = new window.google.maps.Map(mapRef.current, {
        zoom: 5,
        center: coords,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        styles: grayscaleStyles,
      })
    }

    const map = mapObj.current

    // Animation : dézoomer, recentrer, puis zoomer progressivement
    map.setZoom(5)
    map.setCenter(coords)

    setTimeout(() => map.setZoom(9),  300)
    setTimeout(() => map.setZoom(13), 650)
    setTimeout(() => map.setZoom(16), 1000)

    if (markerRef.current) markerRef.current.setMap(null)
    markerRef.current = new window.google.maps.Marker({
      position: coords,
      map,
      animation: window.google.maps.Animation.DROP,
    })
  }, [coords, loaded])

  if (!apiKey) return (
    <div style={{ height: 220, background: '#F3F4F6', borderRadius: 10, border: '1.5px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: 13, color: '#9CA3AF' }}>Clé API Google Maps manquante</p>
    </div>
  )

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=fr`}
        onLoad={initMaps}
        strategy="lazyOnload"
      />

      {/* Z-index pour le dropdown Google Maps autocomplete */}
      <style>{`.pac-container { z-index: 9999 !important; font-family: 'DM Sans', sans-serif; border-radius: 8px; margin-top: 4px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); }`}</style>

      {/* Champ autocomplete — NON contrôlé : Google Maps gère l'input directement */}
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <MapPin size={16} color="#9CA3AF" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          ref={inputRef}
          className="input"
          placeholder="Recherchez votre adresse"
          defaultValue={searchValue}
          style={{ paddingLeft: 40 }}
        />
      </div>

      {/* Carte */}
      <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1.5px solid #E5E7EB' }}>
        <div ref={mapRef} style={{ height: 220, background: '#F3F4F6' }}>
          {!coords && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <MapPin size={28} color="#D1D5DB" strokeWidth={1.5} />
              <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0, fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>
                La carte s'affichera après la saisie de l'adresse
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
