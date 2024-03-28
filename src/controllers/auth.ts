import db from '@root/db'
import { generateJWTKey } from '@root/globals/generateJWTKey'
import { sendEmail } from '@root/globals/sendEmail'
import { Request, Response } from 'express'
import jwt, { VerifyErrors } from 'jsonwebtoken'
import bcrypt from 'bcrypt'

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
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = bcrypt.hashSync(password, salt)
    const query = 'INSERT INTO users (name, email, password, country) VALUES ($1, $2, $3, $4) RETURNING *'
    const userCreated = await db.query(query, [name, email, hashedPassword, country])
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

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body
  try {
    const query = 'SELECT DISTINCT * FROM users WHERE email=$1'
    const foundUser = await db.query(query, [email])
    if (foundUser.rows.length > 0) {
      const user = foundUser.rows[0]
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(400).json({
          message: 'Incorrect password'
        })
      } else {
        const isVerified = user.verified
        if (!isVerified) {
          return res.status(400).json({
            message: 'Account not verified. Please check your email for the verification link'
          })
        }
        const payload = {
          id: user.id,
          role: user.role
        }
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_KEY!, { expiresIn: '10min' })
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_KEY!, { expiresIn: '1d' })
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'none' })
        res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'none' })
        return res.status(201).json({
          message: 'Logged in successfully',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            country: user.country,
            role: user.role,
            profileimage: user.profileimage
          }
        })
      }
    } else {
      return res.status(400).json({
        message: 'User with that email not found'
      })
    }
  } catch (e) {
    console.log('Hey something when wrong controller:loginUser', e)
    return res.status(500).json({ message: 'Something went wrong while logging in. Please try again' })
  }
}

export const logOutUser = async (req: Request, res: Response) => {
  try {
    res.clearCookie('refreshToken', {
      secure: true,
      sameSite: 'none'
    })
    res.clearCookie('accessToken', {
      secure: true,
      sameSite: 'none'
    })
    return res.status(200).json({ message: 'Logged out successfully' })
  } catch (e) {
    console.log('Hey something when wrong controller:logOutUser', e)
    return res.status(500).json({ message: 'Something went wrong while logging out. Please try again' })
  }
}

export const checkLogin = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken

  try {
    if (refreshToken) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY!, async (err: VerifyErrors | null, decoded: any) => {
        if (err) {
          return res.status(401).json({ message: 'Unauthorized. Invalid or expired token' })
        }
        if (decoded) {
          console.log('the decoded is', decoded)
          const query = 'SELECT * FROM users WHERE id=$1'
          const user = await db.query(query, [decoded.id])
          if (user.rows.length > 0) {
            const payload = {
              id: decoded.id,
              role: decoded.role
            }
            const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_KEY!, { expiresIn: '10min' })
            res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'none' })
            const userData = user.rows[0]
            return res.status(200).json({
              message: 'User found',
              user: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                country: userData.country,
                role: userData.role,
                profileimage: userData.profileimage
              }
            })
          } else {
            return res.status(401).json({ message: 'User not found with that id' })
          }
        }
      })
    } else {
      return res.status(401).json({ message: 'Unauthorized' })
    }
  } catch (e) {
    console.log('Hey something when wrong controller:checkLogin', e)
    return res.status(500).json({ message: 'Something went wrong while checking login. Please try again' })
  }
}
