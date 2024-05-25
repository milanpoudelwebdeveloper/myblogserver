import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3 } from '@utils/imageUpload'
import { Request, Response } from 'express'

const bucketName = process.env.BUCKET_NAME!

export const addPost = async (req: Request, res: Response) => {
  try {
    const { title } = req.body
    const postImage = req.file
    if (!title || !postImage) {
      return res.status(400).json({ message: 'Please fill all the fields' })
    }

    const uploadParams = {
      Bucket: bucketName,
      Key: req?.file?.originalname + '-' + Date.now(),
      Body: req?.file?.buffer,
      ContentType: req?.file?.mimetype
    }

    await s3.send(new PutObjectCommand(uploadParams))

    const getObjectParams = {
      Bucket: bucketName,
      Key: uploadParams.Key
    }

    const command = new GetObjectCommand(getObjectParams)
    const url = await getSignedUrl(s3, command, { expiresIn: 518400 })

    return res.status(201).json({
      message: 'Post added successfuly',
      data: {
        title,
        postImage: url
      }
    })
  } catch (e) {
    console.log('hey error while adding post', e)
    return res.status(500).json({ message: 'Something went wrong while performing an action.Please try again' })
  }
}
