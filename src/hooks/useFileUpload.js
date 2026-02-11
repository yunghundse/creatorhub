import { useState } from 'react'
import { supabase, SUPABASE_BUCKET, supabaseUrl } from '../supabase'

const MAX_SIZE = {
  image: 10 * 1024 * 1024,   // 10MB
  video: 50 * 1024 * 1024,   // 50MB
  document: 10 * 1024 * 1024, // 10MB
}

const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  video: ['video/mp4', 'video/quicktime', 'video/webm'],
  document: ['application/pdf'],
}

export function getFileCategory(file) {
  if (!file) return null
  const mime = file.type
  if (ALLOWED_TYPES.image.includes(mime)) return 'image'
  if (ALLOWED_TYPES.video.includes(mime)) return 'video'
  if (ALLOWED_TYPES.document.includes(mime)) return 'document'
  return null
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function useFileUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  const upload = async (file, storagePath) => {
    setError(null)
    setProgress(0)

    const category = getFileCategory(file)
    if (!category) {
      setError('Dateityp nicht erlaubt. Erlaubt: JPG, PNG, WebP, GIF, MP4, MOV, WebM, PDF')
      return null
    }

    const maxSize = MAX_SIZE[category]
    if (file.size > maxSize) {
      setError(`Datei zu groß. Maximum: ${formatFileSize(maxSize)}`)
      return null
    }

    setUploading(true)
    setProgress(10)

    try {
      // storagePath is the full path including filename (e.g. companies/abc/assets/123_photo.jpg)
      setProgress(30)

      const { data, error: uploadError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        })

      if (uploadError) {
        throw uploadError
      }

      setProgress(80)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(data.path)

      const downloadURL = urlData.publicUrl

      setUploading(false)
      setProgress(100)

      return { url: downloadURL, path: data.path }
    } catch (err) {
      setError('Upload fehlgeschlagen: ' + (err.message || 'Unbekannter Fehler'))
      setUploading(false)
      return null
    }
  }

  const deleteFile = async (storagePath) => {
    try {
      const { error: deleteError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .remove([storagePath])

      if (deleteError) {
        console.warn('Delete file error:', deleteError)
      }
    } catch (err) {
      console.warn('Delete file error:', err)
    }
  }

  const reset = () => {
    setUploading(false)
    setProgress(0)
    setError(null)
  }

  return { upload, deleteFile, uploading, progress, error, reset }
}
