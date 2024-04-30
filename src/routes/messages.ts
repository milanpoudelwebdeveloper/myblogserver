import { getMessageDetails, getMessages, postMessage, updateMessageStatus } from '@controllers/messages'
import { adminAccess } from '@root/middleware/auth'
import express from 'express'

const router = express.Router()

router.get('/', adminAccess, getMessages)
router.get('/details/:id', adminAccess, getMessageDetails)
router.post('/', postMessage)
router.put('/:id', adminAccess, updateMessageStatus)

export default router
