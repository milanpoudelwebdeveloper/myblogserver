import { addCategory, deleteCategory, getCategories, getCategoryDetails, updateCategory } from '@controllers/category'
import { uploadMulter } from '@utils/imageUpload'
import express from 'express'

const router = express.Router()
router.post('/', uploadMulter.single('image'), addCategory)
router.get('/', getCategories)
router.get('/:id', getCategoryDetails)
router.put('/:id', uploadMulter.single('image'), updateCategory)
router.delete('/:id', deleteCategory)

export default router
