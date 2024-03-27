import { getAllUsers } from '@controllers/user'
import express from 'express'

const router = express.Router()

router.get('/', getAllUsers)

export default router
