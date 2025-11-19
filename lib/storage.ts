import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import crypto from 'crypto'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

type StorageProvider = 'local' | 's3'

const provider = (process.env.STORAGE_PROVIDER || 'local').toLowerCase() as StorageProvider

let s3Client: S3Client | null = null

function getS3Client(): S3Client {
  if (s3Client) return s3Client

  s3Client = new S3Client({
    region: process.env.S3_REGION || 'eu-central-1',
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === '1',
    credentials: process.env.S3_ACCESS_KEY_ID
      ? {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        }
      : undefined,
  })

  return s3Client
}

function randomFileName(extension: string) {
  const random = crypto.randomBytes(16).toString('hex')
  const timestamp = Date.now()
  return `${timestamp}-${random}${extension}`
}

export type StoredFile = {
  url: string
  key: string
}

async function saveLocalFile(buffer: Buffer, originalName: string, folder: string): Promise<StoredFile> {
  const uploadsDir = join(process.cwd(), 'public', 'uploads', folder)
  await mkdir(uploadsDir, { recursive: true })

  const extension = originalName.match(/\.[a-z0-9]+$/i)?.[0] || '.jpg'
  const fileName = randomFileName(extension.toLowerCase())
  const filePath = join(uploadsDir, fileName)

  await writeFile(filePath, buffer)

  const relativePath = `/uploads/${folder}/${fileName}`
  return {
    url: relativePath,
    key: relativePath,
  }
}

async function saveS3File(buffer: Buffer, originalName: string, folder: string): Promise<StoredFile> {
  const bucket = process.env.S3_BUCKET
  if (!bucket) {
    throw new Error('S3_BUCKET není definováno')
  }

  const extension = originalName.match(/\.[a-z0-9]+$/i)?.[0] || '.jpg'
  const key = `${folder}/${randomFileName(extension.toLowerCase())}`

  const client = getS3Client()

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeFromExtension(extension),
      ACL: process.env.S3_OBJECT_ACL || 'public-read',
    })
  )

  const cdnUrl = process.env.CDN_BASE_URL?.replace(/\/$/, '')
  const region = process.env.S3_REGION || 'eu-central-1'

  const url = cdnUrl
    ? `${cdnUrl}/${key}`
    : `https://${bucket}.s3.${region}.amazonaws.com/${key}`

  return {
    url,
    key,
  }
}

function mimeFromExtension(extension: string) {
  const map: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.heic': 'image/heic',
    '.heif': 'image/heif',
  }
  return map[extension.toLowerCase()] || 'application/octet-stream'
}

export async function storeFile(buffer: Buffer, originalName: string, folder: string): Promise<StoredFile> {
  if (provider === 's3') {
    return saveS3File(buffer, originalName, folder)
  }

  return saveLocalFile(buffer, originalName, folder)
}

export async function storeFiles(buffers: Array<{ buffer: Buffer; originalName: string }>, folder: string) {
  const results: StoredFile[] = []

  for (const file of buffers) {
    const stored = await storeFile(file.buffer, file.originalName, folder)
    results.push(stored)
  }

  return results
}

export function getStorageProvider() {
  return provider
}


