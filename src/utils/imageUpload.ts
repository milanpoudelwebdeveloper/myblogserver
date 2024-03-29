import multer from 'multer'
import { S3Client } from '@aws-sdk/client-s3'
import dotenv from 'dotenv'
dotenv.config()

const storage = multer.memoryStorage()
export const uploadMulter = multer({ storage, limits: { fieldSize: 10 * 1024 * 1024 } })

const bucketRegion = process.env.BUCKET_REGION!
const awsAccessKey = process.env.AWS_ACCESS_KEY!
const AWS_SECRET = process.env.AWS_SECRET!

export const s3 = new S3Client({
  credentials: {
    accessKeyId: awsAccessKey,
    secretAccessKey: AWS_SECRET
  },
  region: bucketRegion
})
