import db from '@root/db'
import { Request, Response } from 'express'

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await db.query('SELECT * FROM category', [])
    if (categories.rows.length > 0) {
      return res.status(200).json(categories.rows)
    } else {
      return res.status(404).json({ message: 'No categories found' })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Something went wrong. Please try again' })
  }
}

export const addCategory = async (req: Request, res: Response) => {
  const { name, image } = req.body
  if (!name || !image) {
    return res.status(400).json({ message: 'Name and image are required' })
  }
  try {
    const category = await db.query('INSERT INTO category (name, image) VALUES($1, $2) RETURNING *', [name, image])
    if (category.rows.length > 0) {
      return res.status(201).json({ message: 'Category added successfully', category: category.rows[0] })
    } else {
      return res.status(500).json({ message: 'Something went wrong. Please try again' })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Something went wrong. Please try again' })
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
