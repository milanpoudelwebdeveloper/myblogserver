import { addSubscription } from '@controllers/subscription'
import express from 'express'

const router = express.Router()

router.post('/add', addSubscription)

export default router
