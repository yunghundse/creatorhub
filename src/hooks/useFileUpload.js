import { useState } from 'react'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../firebase'

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
      setError('Dateityp nicht unterstützt. Erlaubt: JPG, PNG, WebP, GIF, MP4, MOV, WebM, PDF')
      return null
    }

    const maxSize = MAX_SIZE[category]
    if (file.size > maxSize) {
      setError(`Datei zu groß. Maximum: ${formatFileSize(maxSize)}`)
      return null
    }

    setUploading(true)

    try {
      const storageRef = ref(storage, storagePath)
      const uploadTask = uploadBytesResumable(storageRef, file)

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
            setProgress(pct)
          },
          (err) => {
            setError('Upload fehlgeschlagen: ' + err.message)
            setUploading(false)
            reject(err)
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            setUploading(false)
            setProgress(100)
            resolve({ url: downloadURL, path: storagePath })
          }
        )
      })
    } catch (err) {
      setError('Upload fehlgeschlagen: ' + err.message)
      setUploading(false)
      return null
    }
  }

  const deleteFile = async (storagePath) => {
    try {
      const storageRef = ref(storage, storagePath)
      await deleteObject(storageRef)
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
