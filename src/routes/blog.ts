import { addBlog, getBlogs } from '@controllers/blog'
import { uploadMulter } from '@utils/imageUpload'
import express from 'express'

const router = express.Router()

router.get('/', getBlogs)
router.post('/', uploadMulter.single('coverImage'), addBlog)

export default router
