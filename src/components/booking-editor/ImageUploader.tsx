'use client'

import { useState, useRef } from 'react'
import { X, Image as ImageIcon } from 'lucide-react'

interface ImageUploaderProps {
  value: string | null
  onChange: (url: string | null) => void
  onUpload: (file: File) => Promise<string>
  label?: string
  aspectRatio?: string
}

export function ImageUploader({
  value,
  onChange,
  onUpload,
  label,
  aspectRatio = '16/5',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5 Mo')
      return
    }

    setUploading(true)
    try {
      const url = await onUpload(file)
      onChange(url)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {value ? (
        <div className="relative group">
          <div
            className="w-full overflow-hidden rounded-lg border border-gray-200"
            style={{ aspectRatio }}
          >
            <img
              src={value}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow hover:bg-white transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      ) : (
        <div
          className={`relative w-full border-2 border-dashed rounded-lg transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          style={{ aspectRatio }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            ) : (
              <>
                <ImageIcon className="w-10 h-10 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Glisser-déposer ou{' '}
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    parcourir
                  </button>
                </p>
                <p className="text-xs text-gray-400">PNG, JPG jusqu&apos;à 5 Mo</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
