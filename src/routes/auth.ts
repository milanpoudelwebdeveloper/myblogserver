import { changePassword, checkLogin, logOutUser, loginUser, sendVerificationLink, signUp, verifyAccount } from '@controllers/auth'
import express from 'express'

const router = express.Router()

router.post('/signup', signUp)
router.post('/login', loginUser)
router.post('/verifyaccount', verifyAccount)
router.get('/checklogin', checkLogin)
router.get('/logout', logOutUser)
router.post('/sendverification', sendVerificationLink)
router.post('/changepassword', changePassword)

export default router
