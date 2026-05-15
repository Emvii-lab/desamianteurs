'use client'

import { useState, useEffect, useRef } from 'react'
import { parseLocation } from '@/lib/utils'

export type SiretData = {
  raison_sociale: string
  activite: string
  adresse: string
  ville: string
  cp: string
  est_actif: boolean
  lat?: number
  lng?: number
}

export function useSiretValidation(onActivite?: (activite: string) => void) {
  const [siret, setSiret]                     = useState('')
  const [siretStatus, setSiretStatus]         = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [siretData, setSiretData]             = useState<SiretData | null>(null)
  const [siretConfirmed, setSiretConfirmed]   = useState(false)
  const [manualAddress, setManualAddress]     = useState('')
  const [manualCity, setManualCity]           = useState('')
  const [manualZip, setManualZip]             = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const digits = siret.replace(/\D/g, '')
    if (digits.length !== 14) { setSiretStatus('idle'); return }

    setSiretStatus('loading')
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      try {
        const res  = await fetch('/api/verify-siret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siret: digits }),
        })
        const data = await res.json()

        if (!res.ok || !data?.raison_sociale) {
          setSiretStatus('error')
          setSiretData(null)
          return
        }

        let finalAdresse = data.adresse      ?? ''
        let finalVille   = data.ville        ?? ''
        let finalCp      = data.code_postal ?? data.cp ?? ''
        let finalLat: number | undefined
        let finalLng: number | undefined

        const { city, zip } = parseLocation(finalVille, finalAdresse, finalCp)
        finalVille = city
        finalCp    = zip

        try {
          const query  = [finalAdresse, finalCp, finalVille].filter(Boolean).join(' ')
          const geoRes = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=1`)
          const geoData = await geoRes.json()
          if (geoData.features?.[0]) {
            const props  = geoData.features[0].properties
            const coords = geoData.features[0].geometry.coordinates
            if (coords?.length === 2) { finalLng = coords[0]; finalLat = coords[1] }
            if (props.name)     finalAdresse = props.name
            if (props.city)     finalVille   = props.city.toUpperCase()
            if (props.postcode) finalCp      = props.postcode
          }
        } catch { /* géocodage optionnel */ }

        setSiretData({ raison_sociale: data.raison_sociale, activite: data.activite ?? '', adresse: finalAdresse, ville: finalVille, cp: finalCp, est_actif: data.est_actif ?? true, lat: finalLat, lng: finalLng })
        setManualAddress(finalAdresse)
        setManualCity(finalVille)
        setManualZip(finalCp)
        if (data.activite) onActivite?.(data.activite)
        setSiretStatus('ok')
      } catch {
        setSiretStatus('error')
      }
    }, 600)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  // onActivite intentionnellement exclu — fonction stable côté appelant
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siret])

  function reset() {
    setSiret('')
    setSiretStatus('idle')
    setSiretData(null)
    setSiretConfirmed(false)
  }

  return {
    siret, setSiret,
    siretStatus,
    siretData,
    siretConfirmed, setSiretConfirmed,
    manualAddress, setManualAddress,
    manualCity, setManualCity,
    manualZip, setManualZip,
    reset,
  }
}
