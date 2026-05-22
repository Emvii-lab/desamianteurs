'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp, X, Check } from 'lucide-react'

type Option = { id: string; label: string }

type Props = {
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
}

export default function CustomMultiSelect({ options, value = [], onChange, placeholder = 'Sélectionner...', disabled = false }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggleOption = (id: string) => {
    const newValue = value.includes(id)
      ? value.filter(v => v !== id)
      : [...value, id]
    onChange(newValue)
  }

  const selectedLabels = options
    .filter(o => value.includes(o.id))
    .map(o => o.label)

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <div
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', borderRadius: 8, minHeight: 46,
          border: `1.5px solid ${open ? '#C0392B' : '#E5E7EB'}`,
          background: disabled ? '#F9FAFB' : 'white',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'all 0.15s',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flex: 1 }}>
          {value.length === 0 ? (
            <span style={{ fontSize: 14, color: '#9CA3AF', fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>
              {placeholder}
            </span>
          ) : (
            selectedLabels.map(label => (
              <span key={label} style={{
                fontSize: 12, fontWeight: 600, background: 'rgba(192,57,43,0.08)',
                color: '#C0392B', padding: '4px 8px', borderRadius: 6,
                display: 'flex', alignItems: 'center', gap: 4
              }}>
                {label}
                <X size={12} onClick={(e) => { e.stopPropagation(); toggleOption(options.find(o => o.label === label)!.id) }} />
              </span>
            ))
          )}
        </div>
        <div style={{ marginLeft: 8 }}>
          {open
            ? <ChevronUp size={16} color="#9CA3AF" strokeWidth={2} />
            : <ChevronDown size={16} color="#9CA3AF" strokeWidth={2} />
          }
        </div>
      </div>

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
          {options.map(opt => {
            const isSelected = value.includes(opt.id)
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleOption(opt.id)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '11px 16px', fontSize: 14,
                  fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
                  background: isSelected ? 'rgba(192,57,43,0.03)' : 'white',
                  color: isSelected ? '#C0392B' : '#111',
                  fontWeight: isSelected ? 600 : 400,
                  border: 'none', cursor: 'pointer',
                  borderBottom: '1px solid #F3F4F6',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'background 0.1s',
                }}
              >
                {opt.label}
                {isSelected && <Check size={14} />}
              </button>
            )
          })}
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
