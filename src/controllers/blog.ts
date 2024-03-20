import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import db from '@root/db'
import { s3 } from '@utils/imageUpload'
import { Request, Response } from 'express'

const bucketName = process.env.BUCKET_NAME!

export const addBlog = async (req: Request, res: Response) => {
  try {
    const { title, content, category } = req.body

    console.log('req.file heyf', req.file)
    const coverImage = req.file
    if (!title || !content || !coverImage || !category) {
      return res.status(400).json({ message: 'Please fill all the fields' })
    }
    const uploadParams = {
      Bucket: bucketName,
      Key: req?.file?.originalname + '-' + Date.now(),
      Body: req?.file?.buffer,
      ContentType: req?.file?.mimetype
    }
    await s3.send(new PutObjectCommand(uploadParams))
    const query = 'INSERT INTO blog (title, content, coverImage, category) VALUES ($1, $2, $3, $4) RETURNING *'
    const blog = await db.query(query, [title, content, uploadParams.Key, category])
    if (blog.rows.length > 0) {
      return res.status(201).json({ message: 'Blog created successfully', blog: blog.rows[0] })
    } else {
      return res.status(500).json({ message: 'Something went wrong while creating a blog.Please try again' })
    }
  } catch (e) {
    console.log('hey error is', e)
    return res.status(500).json({ message: 'Someting went wrong while creating post.Please try again' })
  }
}

export const getBlogs = async (_: Request, res: Response) => {
  try {
    const blogs = await db.query('SELECT * FROM blog', [])
    console.log('blogs are', blogs.rows)
    if (blogs.rows.length > 0) {
      for (const blog of blogs.rows) {
        const getObjectParams = {
          Bucket: bucketName,
          Key: blog.coverimage
        }
        const command = new GetObjectCommand(getObjectParams)
        const url = await getSignedUrl(s3, command)
        blog.coverimage = url
      }
      return res.status(200).json({
        message: 'Blogs fetched successfully',
        data: blogs.rows
      })
    } else {
      return res.status(404).json({ message: 'No blogs found' })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Something went wrong. Please try again' })
  }
}
