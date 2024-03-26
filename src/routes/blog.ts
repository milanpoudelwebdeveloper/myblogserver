import { addBlog, deleteBlog, getBlogDetails, getBlogs, updateBlog } from '@controllers/blog'
import { uploadMulter } from '@utils/imageUpload'
import express from 'express'

const router = express.Router()

router.get('/', getBlogs)
router.get('/:id', getBlogDetails)
router.post('/', uploadMulter.single('coverImage'), addBlog)
router.put('/:id', uploadMulter.single('coverImage'), updateBlog)
router.delete('/:id', deleteBlog)

export default router
