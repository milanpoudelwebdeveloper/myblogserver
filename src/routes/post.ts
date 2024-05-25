import express from 'express'
import { addPost } from '@controllers/post'
import { uploadMulter } from '@utils/imageUpload'

const router = express.Router()

router.post('/', uploadMulter.single('postImage'), addPost)

export default router
