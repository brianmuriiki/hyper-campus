import * as tus from 'tus-js-client'
import { supabase } from './supabase'

export async function uploadToSupabaseStorage({ bucketName, objectName, file, contentType, onProgress }) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  if (!session?.access_token) throw new Error('Your session expired. Please sign in again and retry the upload.')

  const supabaseUrl = new URL(supabase.supabaseUrl)
  const storageHost = supabaseUrl.hostname.endsWith('.supabase.co')
    ? supabaseUrl.hostname.replace(/\.supabase\.co$/, '.storage.supabase.co')
    : supabaseUrl.host
  const endpoint = `${supabaseUrl.protocol}//${storageHost}/storage/v1/upload/resumable`

  await new Promise((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      chunkSize: 6 * 1024 * 1024,
      metadata: {
        bucketName,
        objectName,
        contentType,
        cacheControl: '3600',
      },
      onProgress(bytesUploaded, bytesTotal) {
        onProgress?.(Math.round((bytesUploaded / bytesTotal) * 100))
      },
      onError(error) {
        reject(new Error(`Storage upload failed: ${error.message || 'connection interrupted'}`))
      },
      onSuccess: resolve,
    })

    upload.start()
  })
}
