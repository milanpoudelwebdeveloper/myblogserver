import db from '@root/db'
import { generateJWTKey } from '@root/globals/generateJWTKey'
import { sendEmail } from '@root/globals/sendEmail'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const clientUrl = process.env.CLIENT_URL

export const signUp = async (req: Request, res: Response) => {
  const { name, email, password, country } = req.body
  try {
    if (!name || !email || !password || !country) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    const user = await db.query('SELECT * FROM users WHERE email=$1', [email])
    if (user?.rows?.length) {
      return res.status(400).json({ message: 'This account already exists. Please sign or or use another email' })
    }
    const query = 'INSERT INTO users (name, email, password, country) VALUES ($1, $2, $3, $4) RETURNING *'
    const userCreated = await db.query(query, [name, email, password, country])
    if (userCreated.rows.length > 0) {
      const token = generateJWTKey(userCreated.rows[0].id)
      const message = `Thank you for signing up with MyBlog. Please verify your account by clicking on the link below.
      ${clientUrl}/verifyaccount?token=${token}`
      sendEmail(email, 'Welcome to MyBlog', message)
      return res.status(201).json({ message: 'User created successfully. Please check your email and verify account before loggin in' })
    } else {
      return res.status(500).json({ message: 'Something went wrong while signing up. Please try again' })
    }
  } catch (e) {
    console.log('hey error while signing up', e)
    return res.status(500).json({ message: 'Something went wrong while signing up. Please try again' })
  }
}

interface JwtPayload {
  id: string
}

export const verifyAccount = async (req: Request, res: Response) => {
  const { token } = req.body
  try {
    if (!token) {
      return res.status(400).json({ message: 'Token is required' })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    console.log('decoded', decoded)
    if (decoded) {
      const query = 'UPDATE users SET verified=true WHERE id=$1'
      await db.query(query, [decoded?.id])
      return res.status(200).json({ message: 'Account verified successfully' })
    } else {
      return res.status(400).json({ message: 'Invalid token' })
    }
  } catch (e) {
    console.log('hey error while verifying account', e)
    return res.status(500).json({ message: 'Something went wrong while verifying account. Please try again' })
  }
}
