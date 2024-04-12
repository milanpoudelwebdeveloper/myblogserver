import {
  addBlog,
  deleteBlog,
  getBlogDetails,
  getBlogs,
  getFeaturedBlog,
  getPopularBlogs,
  getSavedPosts,
  savePost,
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
router.get('/saved/:id', getSavedPosts)
router.post('/', uploadMulter.single('coverImage'), addBlog)
router.post('/save/:id', savePost)
router.put('/:id', uploadMulter.single('coverImage'), updateBlog)
router.delete('/:id', deleteBlog)
router.put('/read/:id', updateBlogReadCount)

export default router
