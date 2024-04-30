import { adminAccess } from './../middleware/auth'
import { createUser, getAllUsers, updateUser } from '@controllers/user'
import express from 'express'

const router = express.Router()

router.get('/', adminAccess, getAllUsers)
router.post('/', adminAccess, createUser)
router.put('/:id', updateUser)

export default router
