import express from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import morgan from 'morgan'
import categoryRoutes from '@routes/category'
import blogRoutes from '@routes/blog'
import authRoutes from '@routes/auth'
import userRoutes from '@routes/user'
import stats from '@routes/stats'
import cors from 'cors'

dotenv.config()

const app = express()

const PORT = process.env.PORT || 5000

const allowedOrigins = ['http://localhost:3000', 'https://www.codewithmilan.com']

app.use(express.json({ limit: '10mb' }))
app.use(
  cors({
    credentials: true,
    // origin: (origin, callback) => {
    //   if (!origin) return callback(null, true)
    //   if (allowedOrigins.indexOf(origin) !== -1) {
    //     return callback(null, true)
    //   }

    //   return callback(new Error('Not allowed by CORS'))
    // },
    origin: allowedOrigins,
    methods: 'POST, GET, PUT, DELETE',
    optionsSuccessStatus: 204,
    allowedHeaders: 'Content-Type, Authorization'
  })
)

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
