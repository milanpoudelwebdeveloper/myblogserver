import { createUser, getAllUsers, updateUser } from '@controllers/user'
import express from 'express'

const router = express.Router()

router.get('/', getAllUsers)
router.post('/', createUser)
router.put('/:id', updateUser)

export default router
