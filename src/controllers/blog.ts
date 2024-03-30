import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import db from '@root/db'
import { s3 } from '@utils/imageUpload'
import { Request, Response } from 'express'

const bucketName = process.env.BUCKET_NAME!

export const addBlog = async (req: Request, res: Response) => {
  try {
    const { title, content, category, published } = req.body
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
    const query = 'INSERT INTO blog (title, content, coverImage, category, published) VALUES ($1, $2, $3, $4, $5) RETURNING *'
    const blog = await db.query(query, [title, content, uploadParams.Key, category, published])
    if (blog.rows.length > 0) {
      const message = published ? 'Blog published successfully' : 'Blog saved as draft successfully'
      return res.status(201).json({ message: message, blog: blog.rows[0] })
    } else {
      return res.status(500).json({ message: 'Something went wrong while performing an action.Please try again' })
    }
  } catch (e) {
    console.log('hey error while adding blog', e)
    return res.status(500).json({ message: 'Something went wrong while performing an action.Please try again' })
  }
}

export const getBlogs = async (req: Request, res: Response) => {
  const { categoryId } = req.query
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let blogs: any = []
    if (categoryId === 'all') {
      blogs = await db.query(
        'SELECT blog.*, category.name AS categoryname FROM blog JOIN category ON blog.category=category.id ORDER BY blog.id DESC',
        []
      )
    } else {
      blogs = await db.query(
        'SELECT blog.*, category.name AS categoryname FROM blog JOIN category ON blog.category=category.id WHERE category=$1 ORDER BY blog.id DESC',
        [categoryId as string]
      )
    }
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
  } catch (e) {
    console.log('hey error while getting blogs', e)
    return res.status(500).json({ message: 'Something went wrong while getting blogs. Please try again' })
  }
}

export const getBlogDetails = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const blogDetails = await db.query('SELECT * FROM blog WHERE id=$1', [id])
    if (blogDetails?.rows?.length) {
      const foundBlog = blogDetails?.rows[0]
      const getObjectParams = {
        Bucket: bucketName,
        Key: foundBlog.coverimage
      }
      const command = new GetObjectCommand(getObjectParams)
      const url = await getSignedUrl(s3, command)
      foundBlog.coverimage = url
      return res.status(201).json({
        message: 'Blog Details fetched successfully',
        data: foundBlog
      })
    } else {
      return res.status(404).json({ message: 'No blog details found' })
    }
  } catch (e) {
    console.log('hey error while getting blog details', e)
    return res.status(500).json({ message: 'Something went wrong while getting blog details. Please try again' })
  }
}

export const updateBlog = async (req: Request, res: Response) => {
  const { title, content, category, published } = req.body
  const { id } = req.params
  console.log('the title here in', title)

  try {
    const findBlog = await db.query('SELECT DISTINCT * FROM blog WHERE id=$1', [id])
    if (findBlog.rows.length > 0) {
      const foundBlog = findBlog.rows[0]
      console.log('the found blog', foundBlog)
      const query = 'UPDATE blog SET title=$1, content=$2, coverImage=$3, category=$4, published=$5 WHERE id=$6 RETURNING *'
      await db.query(query, [title, content, foundBlog.coverimage, category, published, id])
      return res.status(201).json({ message: 'Blog updated successfully' })
    } else {
      return res.status(404).json({ message: 'No blog found' })
    }
  } catch (e) {
    console.log('hey error while saving as draft', e)
    return res.status(500).json({ message: 'Something went wrong while saving as draft. Please try again' })
  }
}

export const deleteBlog = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const findBlog = await db.query('SELECT DISTINCT * FROM blog WHERE id=$1', [id])
    if (findBlog.rows.length > 0) {
      const foundBlog = findBlog.rows[0]
      const query = 'DELETE FROM blog WHERE id=$1'
      await db.query(query, [id])
      const deleteParams = {
        Bucket: bucketName,
        Key: foundBlog.coverimage
      }
      await s3.send(new DeleteObjectCommand(deleteParams))
      return res.status(201).json({ message: 'Blog deleted successfully' })
    } else {
      return res.status(404).json({ message: 'No blog found' })
    }
  } catch (e) {
    console.log('hey error while deleting blog', e)
    return res.status(500).json({ message: 'Something went wrong while deleting blog. Please try again' })
  }
}