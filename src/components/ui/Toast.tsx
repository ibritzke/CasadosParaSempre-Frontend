// src/components/ui/Toast.tsx
import React, { createContext, useContext, useState, useCallback } from 'react'
import styled, { keyframes } from 'styled-components'

const slideUp = keyframes`
  from { opacity: 0; transform: translateX(-50%) translateY(10px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
`

const ToastEl = styled.div`
  position: fixed;
  bottom: 84px;
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  color: #fff;
  padding: 11px 20px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 9999;
  white-space: nowrap;
  animation: ${slideUp} 0.25s ease;
  pointer-events: none;
`

interface ToastCtx { show: (msg: string) => void }
const ToastContext = createContext<ToastCtx>({ show: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null)

  const show = useCallback((m: string) => {
    setMsg(m)
    setTimeout(() => setMsg(null), 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {msg && <ToastEl>{msg}</ToastEl>}
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
