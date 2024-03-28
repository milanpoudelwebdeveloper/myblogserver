import { checkLogin, logOutUser, loginUser, signUp, verifyAccount } from '@controllers/auth'
import express from 'express'

const router = express.Router()

router.post('/signup', signUp)
router.post('/login', loginUser)
router.post('/verifyaccount', verifyAccount)
router.get('/checklogin', checkLogin)
router.get('/logout', logOutUser)

export default router
