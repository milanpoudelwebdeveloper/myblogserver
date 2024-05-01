import {
  addBlog,
  deleteBlog,
  getBlogDetails,
  getBlogs,
  getBlogsByUser,
  getFeaturedBlog,
  getPopularBlogs,
  getSavedPosts,
  isBlogLiked,
  savePost,
  unSavePost,
  updateBlog,
  updateBlogReadCount,
  uploadImage
} from '@controllers/blog'
import { adminAccess, publicAccess, verifyToken } from '@root/middleware/auth'
import { uploadMulter } from '@utils/imageUpload'
import express from 'express'

const router = express.Router()

router.get('/', getBlogs)
router.get('/popular', getPopularBlogs)
router.get('/featured', getFeaturedBlog)
router.get('/details/:id', publicAccess, getBlogDetails)
router.get('/user/:id', verifyToken, getBlogsByUser)
router.get('/saved/:id', verifyToken, getSavedPosts)
router.get('/isliked/:id', verifyToken, isBlogLiked)
router.post('/', uploadMulter.single('coverImage'), addBlog)
router.post('/save/:id', verifyToken, savePost)
router.post('/image/upload', uploadMulter.single('contentImage'), uploadImage)
router.put('/read/:id', updateBlogReadCount)
router.put('/:id', uploadMulter.single('coverImage'), updateBlog)
router.delete('/:id', adminAccess, deleteBlog)
router.delete('/unsave/:id', verifyToken, unSavePost)

export default router
