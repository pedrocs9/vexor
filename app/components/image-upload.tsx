'use client'

import { useUploadThing } from '../lib/uploadthing-client'
import { useState } from 'react'

export default function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const { startUpload } = useUploadThing('productImage')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setUploading(true)

    const res = await startUpload([file])
    if (res?.[0]?.url) {
      onUpload(res[0].url)
    }
    setUploading(false)
  }

  return (
    <div>
      <label style={{
        display: 'block', cursor: 'pointer',
        border: '1px dashed var(--border)',
        borderRadius: 8, overflow: 'hidden',
        textAlign: 'center',
      }}>
        {preview ? (
          <img src={preview} alt="preview" style={{
            width: '100%', height: 120,
            objectFit: 'cover',
          }} />
        ) : (
          <div style={{ padding: '20px', color: 'var(--muted)', fontSize: 13 }}>
            {uploading ? 'Subiendo...' : '📷 Click para subir imagen'}
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  )
}