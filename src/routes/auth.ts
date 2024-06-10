import {
  changePassword,
  checkLogin,
  logOutUser,
  loginUser,
  sendForgotPasswordLink,
  sendVerificationLink,
  signUp,
  updatePassword,
  verifyAccount,
  verifyPasswordReset
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
router.post('/sendforgotpasswordlink', sendForgotPasswordLink)
router.post('/verifypasswordreset', verifyPasswordReset)
router.post('/changepassword', changePassword)
router.put('/updatePassword', verifyToken, updatePassword)

export default router
