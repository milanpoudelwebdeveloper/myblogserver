import {
  changePassword,
  checkLogin,
  logOutUser,
  loginUser,
  sendVerificationLink,
  signUp,
  updatePassword,
  verifyAccount
} from '@controllers/auth'
import { verifyToken } from '@root/middleware/auth'
import express from 'express'

const router = express.Router()

router.post('/signup', signUp)
router.post('/login', loginUser)
router.post('/verifyaccount', verifyAccount)
router.get('/checklogin', checkLogin)
router.get('/logout', logOutUser)
router.post('/sendverification', sendVerificationLink)
router.post('/changepassword', changePassword)
router.put('/updatePassword', verifyToken, updatePassword)

export default router
