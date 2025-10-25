"use client"

import { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { cn } from "@/lib/utils"

type Props = {
    value?: File | string | null
    onChange: (file: File | null) => void
  }
  

export function AvatarDropzone({ value, onChange }: Props) {
  const [preview, setPreview] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    onChange(file)
  }, [onChange])

  useEffect(() => {
    if (!value) {
      setPreview(null)
    } else if (typeof value === "string") {
      setPreview(value)
    } else {
      const objectUrl = URL.createObjectURL(value)
      setPreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }
  }, [value])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": []
    },
    maxFiles: 1
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer relative overflow-hidden transition",
        isDragActive ? "border-primary bg-muted" : "border-muted"
      )}
    >
      <input {...getInputProps()} />
      {preview ? (
        <Image
          src={preview}
          alt="Avatar Preview"
          fill
          className="object-cover rounded-full"
        />
      ) : (
        <p className="text-xs text-muted-foreground text-center px-2">Drag or click to upload</p>
      )}
      {/* Optional overlay */}
      <div className="absolute inset-0 rounded-full ring-2 ring-muted-foreground/10 pointer-events-none" />
    </div>
  )
}
