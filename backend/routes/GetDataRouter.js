import express from 'express'
import getData from '../controllers/GetDataController.js'

const router = express.Router()

router.get("/chart",getData.chart)
router.get("/get-area",getData.getArea)

export default router