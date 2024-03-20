import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import db from '@root/db'
import { s3 } from '@utils/imageUpload'
import { Request, Response } from 'express'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const bucketName = process.env.BUCKET_NAME!

export const getCategories = async (_: Request, res: Response) => {
  try {
    const categories = await db.query('SELECT * FROM category', [])

    if (categories.rows.length > 0) {
      for (const category of categories.rows) {
        const getObjectParams = {
          Bucket: bucketName,
          Key: category.image
        }
        const command = new GetObjectCommand(getObjectParams)
        const url = await getSignedUrl(s3, command)
        category.image = url
      }
      return res.status(200).json({
        message: 'Categories fetched successfully',
        data: categories.rows
      })
    } else {
      return res.status(404).json({ message: 'No categories found' })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Something went wrong. Please try again' })
  }
}

export const addCategory = async (req: Request, res: Response) => {
  const { name } = req.body
  if (!name || !req.file) {
    return res.status(400).json({ message: 'Name and image are required' })
  }
  try {
    const categoryExists = await db.query('SELECT * FROM category WHERE name=$1', [name])
    if (categoryExists.rows.length > 0) {
      return res.status(400).json({ message: 'Category already exists' })
    }
    const uploadParams = {
      Bucket: bucketName,
      Key: req?.file?.originalname + '-' + Date.now(),
      Body: req?.file?.buffer,
      ContentType: req?.file?.mimetype
    }
    await s3.send(new PutObjectCommand(uploadParams))
    const category = await db.query('INSERT INTO category (name, image) VALUES($1, $2) RETURNING *', [name, uploadParams.Key])
    if (category.rows.length > 0) {
      return res.status(201).json({ message: 'Category added successfully', category: category.rows[0] })
    } else {
      return res.status(500).json({ message: 'Something went wrong while creating a new category.Please try again' })
    }
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong with the server' })
  }
}

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, image } = req.body
    if (!name || !image) {
      return res.status(400).json({ message: 'Name and image are required' })
    } else {
      const category = await db.query('UPDATE category SET name=$1, image=$2 WHERE id=$3 RETURNING *', [name, image, id])
      if (category.rows.length > 0) {
        return res.status(200).json({ message: 'Category updated successfully', category: category.rows[0] })
      } else {
        return res.status(404).json({ message: 'Category not found' })
      }
    }
  } catch (e) {
    return res.status(500).json({ message: 'Something went wrong. Please try again' })
  }
}

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await db.query('DELETE FROM category WHERE id=$1 RETURNING *', [id])
    return res.status(200).json({ message: 'Category deleted successfully' })
  } catch (e) {
    return res.status(500).json({ message: 'Something went wrong. Please try again' })
  }
}
