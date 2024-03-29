import db from '@root/db'
import { Request, Response } from 'express'

export const getStats = async (_: Request, res: Response) => {
  try {
    const query = 'SELECT COUNT(*) as totalBlogs FROM blog'
    const blogCount = await db.query(query, [])
    const query2 = 'SELECT COUNT(*) as totalCategories FROM category'
    const categoryCount = await db.query(query2, [])
    const query3 = 'SELECT COUNT(*) as totalUsers FROM users'
    const userCount = await db.query(query3, [])

    const stats = {
      totalBlogs: blogCount.rows[0].totalblogs,
      totalCategories: categoryCount.rows[0].totalcategories,
      totalUsers: userCount.rows[0].totalusers
    }

    res.status(200).json({ message: 'Feteched successfully', data: stats })
  } catch (e) {
    console.log('Error while fetching controller stats:', e)
    res.status(500).json({ message: 'Something went wrong while fetching stats. Please try again' })
  }
}
