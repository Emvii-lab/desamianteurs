'use client'

import { useState, useRef, useCallback } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useClickOutside } from '@/lib/hooks/useClickOutside'

type Option = { id: string; label: string }

type Props = {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export default function CustomSelect({ options, value, onChange, placeholder = 'Sélectionner...', disabled = false }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const selected = options.find(o => o.id === value)
  const close = useCallback(() => setOpen(false), [])
  useClickOutside(ref, close)

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderRadius: 8,
          border: `1.5px solid ${open ? '#C0392B' : '#E5E7EB'}`,
          background: disabled ? '#F9FAFB' : 'white',
          fontSize: 14, fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
          color: selected ? '#111' : '#9CA3AF',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'border-color 0.15s',
          textAlign: 'left',
        }}
      >
        <span>{selected ? selected.label : placeholder}</span>
        {open
          ? <ChevronUp size={16} color="#9CA3AF" strokeWidth={2} />
          : <ChevronDown size={16} color="#9CA3AF" strokeWidth={2} />
        }
      </button>

      {/* Dropdown */}
      {open && !disabled && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'white', borderRadius: 8,
          border: '1px solid #E5E7EB',
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          zIndex: 50, overflow: 'hidden',
          maxHeight: 260, overflowY: 'auto',
        }}>
          {options.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onChange(opt.id)
                setOpen(false)
                // Retour du focus sur le trigger sans scroll —
                // évite que le browser scrolle vers le premier élément
                // focusable de la nouvelle section conditionnelle
                triggerRef.current?.focus({ preventScroll: true })
              }}
              style={{
                width: '100%', textAlign: 'left',
                padding: '11px 16px', fontSize: 14,
                fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
                background: opt.id === value ? 'rgba(192,57,43,0.05)' : 'white',
                color: opt.id === value ? '#C0392B' : '#111',
                fontWeight: opt.id === value ? 600 : 400,
                border: 'none', cursor: 'pointer',
                borderBottom: '1px solid #F3F4F6',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (opt.id !== value) e.currentTarget.style.background = '#F9FAFB' }}
              onMouseLeave={e => { if (opt.id !== value) e.currentTarget.style.background = 'white' }}
            >
              {opt.label}
            </button>
          ))}
          {options.length === 0 && (
            <div style={{ padding: '12px 16px', fontSize: 13, color: '#9CA3AF', fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>
              Aucune option disponible
            </div>
          )}
        </div>
      )}
    </div>
  )
}