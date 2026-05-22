'use client'

import { useState, useEffect } from 'react'

export type ConsentState = {
  essential: true
  maps: boolean
  decided: boolean
}

const COOKIE_NAME = 'cookie_consent'
const MAX_AGE = 60 * 60 * 24 * 365 // 1 an

function readConsent(): ConsentState | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`))
  if (!match) return null
  try { return JSON.parse(decodeURIComponent(match[1])) } catch { return null }
}

function writeConsent(state: ConsentState) {
  const value = encodeURIComponent(JSON.stringify(state))
  document.cookie = `${COOKIE_NAME}=${value}; max-age=${MAX_AGE}; path=/; samesite=lax; secure`
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentState | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setConsent(readConsent())
    setReady(true)
  }, [])

  const acceptAll = () => {
    const s: ConsentState = { essential: true, maps: true, decided: true }
    writeConsent(s)
    setConsent(s)
  }

  const declineAll = () => {
    const s: ConsentState = { essential: true, maps: false, decided: true }
    writeConsent(s)
    setConsent(s)
  }

  const saveCustom = (maps: boolean) => {
    const s: ConsentState = { essential: true, maps, decided: true }
    writeConsent(s)
    setConsent(s)
  }

  return { consent, ready, acceptAll, declineAll, saveCustom }
}
