import { addCategory, deleteCategory, getCategories, updateCategory } from '@controllers/category'
import { uploadMulter } from '@utils/imageUpload'
import express from 'express'

const router = express.Router()
router.post('/category', uploadMulter.single(''), addCategory)
router.get('/category', getCategories)
router.put('/category/:id', updateCategory)
router.delete('/category/:id', deleteCategory)

export default router
