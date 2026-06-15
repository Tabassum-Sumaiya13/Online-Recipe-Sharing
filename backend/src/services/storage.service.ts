import { uploadFile } from '../utils/storage'
import { AppError } from '../utils/AppError'

export async function handleImageUpload(
  file: Express.Multer.File | undefined,
  baseUrl: string,
): Promise<{ url: string }> {
  if (!file) throw new AppError('No file provided', 400, 'NO_FILE')
  return uploadFile(file, baseUrl)
}

export async function handleMultipleImageUploads(
  files: Express.Multer.File[] | undefined,
  baseUrl: string,
): Promise<{ urls: string[] }> {
  if (!files || files.length === 0) throw new AppError('No files provided', 400, 'NO_FILE')
  const results = await Promise.all(files.map((f) => uploadFile(f, baseUrl)))
  return { urls: results.map((r) => r.url) }
}
