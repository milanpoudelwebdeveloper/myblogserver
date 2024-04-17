import { getMessageDetails, getMessages, postMessage, updateMessageStatus } from '@controllers/messages'
import express from 'express'

const router = express.Router()

router.get('/', getMessages)
router.get('/details/:id', getMessageDetails)
router.post('/', postMessage)
router.put('/:id', updateMessageStatus)

export default router
