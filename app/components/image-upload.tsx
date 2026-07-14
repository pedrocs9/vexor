'use client'

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react'
import { useUploadThing } from '../lib/uploadthing-client'

const MAX_IMAGE_SIZE = 2 * 1024 * 1024

type UploadedFile = {
  ufsUrl?: string
  url?: string
}

type ImageUploadProps = {
  onUpload: (url: string) => void
  onUploadingChange?: (uploading: boolean) => void
}

export default function ImageUpload({ onUpload, onUploadingChange }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { startUpload } = useUploadThing('productImage')

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    e.target.value = ''

    if (!file.type.startsWith('image/')) {
      setError('Selecciona un archivo de imagen valido.')
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError('La imagen debe pesar 2 MB o menos.')
      return
    }

    const nextPreview = URL.createObjectURL(file)
    setPreview((currentPreview) => {
      if (currentPreview) URL.revokeObjectURL(currentPreview)
      return nextPreview
    })
    setUploading(true)
    onUploadingChange?.(true)

    try {
      const res = await startUpload([file])
      const uploadedFile = res?.[0] as UploadedFile | undefined
      const uploadedUrl = uploadedFile?.ufsUrl ?? uploadedFile?.url

      if (uploadedUrl) {
        onUpload(uploadedUrl)
      } else {
        setError('No se pudo obtener la URL de la imagen.')
      }
    } catch (err) {
      console.error(err)
      setError('No se pudo subir la imagen. Intenta nuevamente.')
    } finally {
      setUploading(false)
      onUploadingChange?.(false)
    }
  }

  return (
    <div>
      <label
        style={{
          display: 'block',
          cursor: uploading ? 'not-allowed' : 'pointer',
          border: '1px dashed var(--border)',
          borderRadius: 8,
          overflow: 'hidden',
          textAlign: 'center',
          opacity: uploading ? 0.75 : 1,
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Vista previa"
            style={{
              width: '100%',
              height: 120,
              objectFit: 'cover',
            }}
          />
        ) : (
          <div style={{ padding: '20px', color: 'var(--muted)', fontSize: 13 }}>
            {uploading ? 'Subiendo...' : 'Click para subir imagen'}
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </label>
      {error && (
        <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 8 }}>
          {error}
        </p>
      )}
    </div>
  )
}
