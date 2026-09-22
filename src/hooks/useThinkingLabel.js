import { useEffect, useRef, useState } from 'react'

const LABELS = ['Thinking', 'Reading your notes', 'Connecting the dots', 'Working it out', 'Fathoming']

export function useThinkingLabel(active) {
  const [label, setLabel] = useState(LABELS[0])
  const indexRef = useRef(0)

  useEffect(() => {
    if (!active) {
      indexRef.current = 0
      setLabel(LABELS[0])
      return
    }

    const interval = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % LABELS.length
      setLabel(LABELS[indexRef.current])
    }, 1400)

    return () => clearInterval(interval)
  }, [active])

  return label
}