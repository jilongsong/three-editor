"use client"

import { useEffect } from "react"
import { useEditorStore } from "@/stores/editor-store"

export function useAnimation() {
  const { isAnimationPlaying, animationTime, setAnimationTime } = useEditorStore()

  useEffect(() => {
    if (!isAnimationPlaying) return

    const startTime = Date.now() - animationTime * 1000

    const animate = () => {
      const currentTime = (Date.now() - startTime) / 1000
      setAnimationTime(currentTime)

      if (isAnimationPlaying) {
        requestAnimationFrame(animate)
      }
    }

    const animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [isAnimationPlaying, setAnimationTime])
}
