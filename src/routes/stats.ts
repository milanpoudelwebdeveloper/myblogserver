import { getStats } from '@controllers/stats'
import express from 'express'

const router = express.Router()

router.get('/', getStats)

export default router
