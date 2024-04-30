import { addCategory, deleteCategory, getCategories, getCategoryDetails, updateCategory } from '@controllers/category'
import { adminAccess } from '@root/middleware/auth'
import { uploadMulter } from '@utils/imageUpload'
import express from 'express'

const router = express.Router()
router.post('/', uploadMulter.single('image'), addCategory)
router.get('/', getCategories)
router.get('/:id', adminAccess, getCategoryDetails)
router.put('/:id', adminAccess, uploadMulter.single('image'), updateCategory)
router.delete('/:id', adminAccess, deleteCategory)

export default router
