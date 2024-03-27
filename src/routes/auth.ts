import { signUp, verifyAccount } from '@controllers/auth'
import express from 'express'

const router = express.Router()

router.post('/signup', signUp)
router.post('/verifyaccount', verifyAccount)

export default router
