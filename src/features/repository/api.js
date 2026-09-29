import { supabase } from '../../lib/supabase'
import { MIME_TYPES_BY_EXTENSION } from '../../lib/fileTypes'
import * as tus from 'tus-js-client'

export async function listUnits(userId) {
  const { data, error } = await supabase
    .from('units')
    .select('id, name, course, created_at, files(count)')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getUnit(unitId) {
  const { data, error } = await supabase.from('units').select('*').eq('id', unitId).single()
  if (error) throw error
  return data
}

export async function createUnit({ ownerId, name, course }) {
  const { data, error } = await supabase
    .from('units')
    .insert({ owner_id: ownerId, name, course })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function listFiles(unitId) {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('unit_id', unitId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function uploadFile({ file, fileType, unitId, userId, onProgress }) {
  const ext = file.name.split('.').pop()?.toLowerCase()
  const storageKey = `${userId}/${unitId}/${crypto.randomUUID()}.${ext}`
  const contentType = MIME_TYPES_BY_EXTENSION[ext] || file.type || 'application/octet-stream'

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
        bucketName: 'repository-files',
        objectName: storageKey,
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

  const { data, error } = await supabase
    .from('files')
    .insert({
      unit_id: unitId,
      uploader_id: userId,
      file_type: fileType,
      storage_key: storageKey,
      original_filename: file.name,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteFile({ fileId, storageKey }) {
  await supabase.storage.from('repository-files').remove([storageKey])
  const { error } = await supabase.from('files').delete().eq('id', fileId)
  if (error) throw error
}
export async function deleteUnit({ unitId, userId }) {
  // Storage doesn't cascade when the DB row is deleted, so clean up the
  // actual files first, then let the DB cascade remove the file rows.
  const { data: files, error: listError } = await supabase
    .from('files')
    .select('storage_key')
    .eq('unit_id', unitId)

  if (listError) throw listError

  if (files?.length) {
    const keys = files.map((f) => f.storage_key)
    await supabase.storage.from('repository-files').remove(keys)
  }

  const { error } = await supabase.from('units').delete().eq('id', unitId).eq('owner_id', userId)
  if (error) throw error
}
export async function getSignedUrl(storageKey, expiresIn = 300) {
  const { data, error } = await supabase.storage
    .from('repository-files')
    .createSignedUrl(storageKey, expiresIn)
  if (error) throw error
  return data.signedUrl
}
