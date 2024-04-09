import {
  addBlog,
  deleteBlog,
  getBlogDetails,
  getBlogs,
  getFeaturedBlog,
  getPopularBlogs,
  updateBlog,
  updateBlogReadCount
} from '@controllers/blog'
import { uploadMulter } from '@utils/imageUpload'
import express from 'express'

const router = express.Router()

router.get('/', getBlogs)
router.get('/popular', getPopularBlogs)
router.get('/featured', getFeaturedBlog)
router.get('/details/:id', getBlogDetails)
router.post('/', uploadMulter.single('coverImage'), addBlog)
router.put('/:id', uploadMulter.single('coverImage'), updateBlog)
router.delete('/:id', deleteBlog)
router.put('/read/:id', updateBlogReadCount)

export default router
