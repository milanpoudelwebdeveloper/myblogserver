import {
  addBlog,
  deleteBlog,
  getBlogDetails,
  getBlogs,
  getBlogsByUser,
  getFeaturedBlog,
  getPopularBlogs,
  getSavedPosts,
  savePost,
  unSavePost,
  updateBlog,
  updateBlogReadCount,
  uploadImage
} from '@controllers/blog'
import { uploadMulter } from '@utils/imageUpload'
import express from 'express'

const router = express.Router()

router.get('/', getBlogs)
router.get('/popular', getPopularBlogs)
router.get('/featured', getFeaturedBlog)
router.get('/details/:id', getBlogDetails)
router.get('/user/:id', getBlogsByUser)
router.get('/saved/:id', getSavedPosts)
router.post('/', uploadMulter.single('coverImage'), addBlog)
router.post('/save/:id', savePost)
router.post('/image/upload', uploadMulter.single('contentImage'), uploadImage)
router.put('/read/:id', updateBlogReadCount)
router.put('/:id', uploadMulter.single('coverImage'), updateBlog)
router.delete('/:id', deleteBlog)
router.delete('/unsave/:id', unSavePost)

export default router
