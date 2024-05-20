import db from '@root/db'
import { Request, Response } from 'express'

export const addSubscription = async (req: Request, res: Response) => {
  const { email } = req.body
  try {
    const query = 'SELECT * FROM subscriptions WHERE email = $1'
    const ifEmailExists = await db.query(query, [email])
    if (ifEmailExists.rows.length > 0) {
      return res.status(400).json({ message: 'Email is already subscribed' })
    }
    const insertQuery = 'INSERT INTO subscriptions (email) VALUES ($1)'
    await db.query(insertQuery, [email])
    return res.status(201).json({ message: 'Subscribed successfully' })
  } catch (e) {
    console.log('hey error while adding subscription up', e)
    return res.status(500).json({ message: 'Something went wrong while subscribing. Please try again' })
  }
}
