"use client"

import { useCallback } from "react"

export function BlobPreview({ blob, alt }: { blob: Blob; alt: string }) {
  const attach = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img) return
      const url = URL.createObjectURL(blob)
      img.src = url
      return () => URL.revokeObjectURL(url)
    },
    [blob] 
  )

  return (
    // eslint-disable-next-line @next/next/no-img-element -- blob: URLs can't go through next/image
    <img ref={attach} alt={alt} className="h-full w-full object-contain" />
  )
}
