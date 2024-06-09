import db from '@root/db'
import { generateJWTKey } from '@root/globals/generateJWTKey'
import { sendEmail } from '@root/globals/sendEmail'
import { Request, Response } from 'express'

const clientUrl = process.env.CLIENT_URL

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

enum roles {
  admin = 'admin',
  writer = 'writer'
}

const roleOptions = [roles.admin, roles.writer]

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body
    if (!email || !role) {
      return res.status(400).json({ message: 'Both email and role are required' })
    }
    if (roleOptions?.indexOf(role) === -1) {
      return res.status(400).json({ message: 'Invalid role provided' })
    }
    const user = await db.query('SELECT * FROM users WHERE email=$1', [email])
    if (user?.rowCount) {
      return res.status(400).json({ message: 'User with that email already exists' })
    }
    const randomPassword = Math.random().toString(36).slice(-8)
    const query = 'INSERT INTO users(email, role, password) VALUES($1, $2, $3) RETURNING id'
    const userCreated = await db.query(query, [email, role, randomPassword])
    if (userCreated?.rowCount) {
      const token = generateJWTKey(userCreated.rows[0].id, role)
      const message = `You are invited to the platform "Code With Milan" to contribute as an ${role}. Please verify your account by clicking on the link below and please set your password.
      ${clientUrl}/verifyaccount?token=${token}`
      sendEmail(email, 'Welcome to MyBlog', message)
      return res.status(201).json({ message: 'User created successfully' })
    } else {
      return res.status(500).json({ message: 'Something went wrong while creating user' })
    }
  } catch (e) {
    console.log('Something went wrong: Controller: createUser', e)
    return res.status(500).json({ message: 'Something went wrong while creating user' })
  }
}

export const updateUser = async (req: Request, res: Response) => {
  const { name, country, gender, email, bio } = req.body
  const { id } = req.params
  try {
    if (!name || !country || !id) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    const foundUser = await db.query('SELECT * FROM users WHERE id=$1', [id])
    if (!foundUser?.rowCount || !foundUser) {
      return res.status(404).json({ message: 'User with that id not found' })
    }
    const query =
      'UPDATE users SET name=$1, country=$2, gender=$3, email=$4, bio=$5 WHERE id=$6 RETURNING name, email, country, gender, bio'
    const updatedUser = await db.query(query, [name, country, gender, email, bio, id])
    if (!updatedUser?.rowCount) {
      return res.status(500).json({ message: 'Something went wrong while updating user' })
    }
    return res.status(200).json({ message: 'User updated successfully', user: updatedUser.rows[0] })
  } catch (e) {
    console.log('Something went wrong: Controller: updateUser', e)
    return res.status(500).json({ message: 'Something went wrong while updating user' })
  }
}
