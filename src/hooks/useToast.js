import { createContext, useContext, useState, useCallback, useRef } from 'react'

export const ToastContext = createContext(null)

export function useToastState() {
  const [toast, setToast]     = useState(null)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)

  const show = useCallback((message, type = 'info') => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ message, type })
    setVisible(true)
    timerRef.current = setTimeout(() => setVisible(false), 3500)
  }, [])

  const dismiss = useCallback(() => setVisible(false), [])

  return { toast, visible, show, dismiss }
}

export function useToast() {
  return useContext(ToastContext)
}
