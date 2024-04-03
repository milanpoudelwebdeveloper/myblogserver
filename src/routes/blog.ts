import { addBlog, deleteBlog, getBlogDetails, getBlogs, getPopularBlogs, updateBlog, updateBlogReadCount } from '@controllers/blog'
import { uploadMulter } from '@utils/imageUpload'
import express from 'express'

const router = express.Router()

router.get('/popular', getPopularBlogs)
router.get('/', getBlogs)
router.get('/:id', getBlogDetails)
router.post('/', uploadMulter.single('coverImage'), addBlog)
router.put('/:id', uploadMulter.single('coverImage'), updateBlog)
router.delete('/:id', deleteBlog)
router.put('/read/:id', updateBlogReadCount)

export default router
