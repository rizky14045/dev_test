import express from 'express'
import cors from 'cors'

const app = express()
const port = 8090

import GetDataRouter from './routes/GetDataRouter.js'


app.use(cors())
app.use("/",GetDataRouter)
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`)
})
