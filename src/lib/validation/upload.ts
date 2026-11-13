export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

/** Returns an error message, or null when the file may be uploaded. */
export function validateUploadFile(file: { name: string; size: number }): string | null {
  const name = file.name.toLowerCase()
  const okType = name.endsWith('.csv') || name.endsWith('.json')
  if (!okType || file.size > MAX_UPLOAD_BYTES || file.size === 0) {
    return 'Upload a CSV or JSON file up to 5 MB.'
  }
  return null
}
