'use client'
import { useEffect, useRef } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function AutoProcessing({ label, onMount }) {
  const called = useRef(false)
  useEffect(() => {
    if (!called.current) {
      called.current = true
      onMount()
    }
  }, [onMount])

  return (
    <div className="container" style={{ paddingTop: 60 }}>
      <LoadingSpinner label={label} />
    </div>
  )
}
