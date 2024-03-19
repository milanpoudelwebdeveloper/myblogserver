import multer from 'multer'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

const storage = multer.memoryStorage()
export const uploadMulter = multer({ storage })

const bucketName = process.env.BUCKET_NAME!
const bucketRegion = process.env.BUCKET_REGION!
const awsAccessKey = process.env.AWS_ACCESS_KEY!
const AWS_SECRET = process.env.AWS_SECRET!

const s3 = new S3Client({
  credentials: {
    accessKeyId: awsAccessKey,
    secretAccessKey: AWS_SECRET
  },
  region: bucketRegion
})

export const uploadImage = async (file: Express.Multer.File) => {
  try {
    const uploadParams = {
      Bucket: bucketName,
      Key: file.originalname + '-' + Date.now(),
      Body: file.buffer,
      ContentType: file.mimetype
    }
    await s3.send(new PutObjectCommand(uploadParams))
    return uploadParams.Key
  } catch (error) {
    console.log(error)
  }
}
