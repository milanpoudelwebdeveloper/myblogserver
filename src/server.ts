import express from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import morgan from 'morgan'
import categoryRoutes from '@routes/category'
import blogRoutes from '@routes/blog'
import authRoutes from '@routes/auth'
import userRoutes from '@routes/user'
import stats from '@routes/stats'
import messageRoutes from '@routes/messages'
import cors from 'cors'
import compression from 'compression'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const allowedOrigins = ['http://localhost:3000', 'https://www.codewithmilan.com', 'https://codewithmilan.com']

app.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    optionsSuccessStatus: 204,
    allowedHeaders: 'Content-Type, Authorization'
  })
)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan('dev'))
app.set('trust proxy', 1)
app.use(compression())
app.use('/api/category', categoryRoutes)
app.use('/api/blog', blogRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/stats', stats)
app.use('/api/messages', messageRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
