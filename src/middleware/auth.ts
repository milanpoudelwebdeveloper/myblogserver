import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user?: any // Define the user property as optional
    }
  }
}

export const publicAccess = (req: Request, res: Response, next: NextFunction) => {
  console.log('in the public access token is', req.cookies.accessToken)
  try {
    const token = req.cookies.accessToken
    if (!token) {
      return next()
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jwt.verify(token, process.env.JWT_ACCESS_KEY!, (err: any, user: any) => {
      if (err) {
        return next()
      }
      if (user) {
        req.user = user
      }
      next()
    })
  } catch (e) {
    console.log('Hey something when wrong middleware:unAuthVerifyToken', e)
    return res.status(500).json({ message: 'Something went wrong. Please try again' })
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  console.log('in verify token the access token is', req.cookies.accessToken)
  try {
    const token = req.cookies.accessToken
    console.log('the token in verifyToken is', token)
    if (!token) return res.status(401).json({ message: 'No access token found' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jwt.verify(token, process.env.JWT_ACCESS_KEY!, (err: any, user: any) => {
      if (err) return res.status(401).json({ message: 'Token is not valid' })
      req.user = user
      next()
    })
  } catch (e) {
    console.log('Hey something when wrong middleware:verifyToken', e)
    return res.status(500).json({ message: 'Something went wrong.Please try again' })
  }
}

export const adminAccess = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.accessToken
    if (!token) return res.status(401).json({ message: 'No access token found' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jwt.verify(token, process.env.JWT_ACCESS_KEY!, (err: any, user: any) => {
      if (err) return res.status(401).json({ message: 'Token is not valid' })
      if (user?.role === 'admin' || user?.role === 'superadmin') {
        req.user = user
        return next()
      }
      return res.status(403).json({ message: 'You are not permitted to perform this action' })
    })
  } catch (e) {
    console.log('Hey something when wrong middleware:adminAccess', e)
    return res.status(500).json({ message: 'Something went wrong.Please try again' })
  }
}
