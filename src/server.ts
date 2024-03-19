import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import categoryRoutes from '@routes/category'

dotenv.config()

const app = express()

const PORT = process.env.PORT || 5000

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Acess-Control-Allow-Credentials', 'true')
  next()
})
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  })
)
app.set('trust proxy', 1)

app.use('/api/category', categoryRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
