import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import prisma from './config/db'
import stockRoutes from './routes/stock.route'
import simulatorRouter from './routes/simulator.route'
import { asyncHandler } from './middleware/async.middleware'
import { errorHandler, notFound } from './middleware/error.middleware'
import { startSimulator } from './services/simulator.service'
import { connectRabbit } from './config/rabbit'
dotenv.config()

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/health', asyncHandler(async (req, res) => {
  await prisma.$queryRaw`SELECT 1`
  res.json({ status: 'ok' })
}))

// routes
app.use('/', stockRoutes)
app.use('/', simulatorRouter)


app.use(notFound)
app.use(errorHandler)

// connect RabbitMQ — non-blocking
connectRabbit().catch(err => console.error('[RabbitMQ] Connection error:', err));

//This will start the simulator if the environment variable is set to true. It is disabled by default to prevent accidental market simulation in production environments.
// disabled by default — set MARKET_SIMULATOR_ENABLED=true to enable
if (process.env.MARKET_SIMULATOR_ENABLED === 'true') {
  startSimulator()
}

// export app — server.ts handles listen + Socket.IO
export default app