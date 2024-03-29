import db from '@root/db'
import { Request, Response } from 'express'

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const query = 'SELECT id, name, email, role, profileimage, verified FROM users'
    const users = await db.query(query, [])
    if (users?.rows?.length) {
      return res.status(200).json({ users: users.rows })
    } else {
      return res.status(404).json({ message: 'No users found' })
    }
  } catch (e) {
    console.log('Something went wrong: Controller: getAllUsers', e)
    return res.status(500).json({ message: 'Something went wrong while gettng users list' })
  }
}
