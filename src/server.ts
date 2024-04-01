import express, { NextFunction, Request, Response } from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import morgan from 'morgan'
import categoryRoutes from '@routes/category'
import blogRoutes from '@routes/blog'
import authRoutes from '@routes/auth'
import userRoutes from '@routes/user'
import stats from '@routes/stats'

dotenv.config()

const app = express()

const PORT = process.env.PORT || 5000

app.use((_: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  next()
})
console.log('they running')
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan('dev'))
app.set('trust proxy', 1)
app.use('/api/category', categoryRoutes)
app.use('/api/blog', blogRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/stats', stats)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
