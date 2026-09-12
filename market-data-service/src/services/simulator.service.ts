import prisma from "../config/db"
import { recordPrice } from "./market.service"

// simulator config — loaded from env once on startup
const config = {
  intervalMs:       parseInt(process.env.MARKET_SIMULATOR_INTERVAL_MS       || "10000"),
  maxChangePercent: parseFloat(process.env.MARKET_SIMULATOR_MAX_CHANGE_PERCENT || "2"),
}

// simulator state
let running = false
let timer:   NodeJS.Timeout | null = null

// ── helpers ──────────────────────────────────────────────────────────────────

// random float between min and max
function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

// pick N random items from array
function pickRandom<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n)
}

// calculate new price — 60% chance up, 40% chance down, never below ₹1
function nextPrice(current: number): number {
  const change     = current * (randomBetween(0, config.maxChangePercent) / 100)
  const direction  = Math.random() < 0.6 ? 1 : -1
  return Math.max(1, parseFloat((current + change * direction).toFixed(2)))
}

// ── tick ─────────────────────────────────────────────────────────────────────

// runs every interval — picks 1-3 random stocks and updates their price
async function tick() {
  const stocks = await prisma.stock.findMany({
    include: { prices: { orderBy: { timestamp: "desc" }, take: 1 } },
  })

  // only simulate stocks that already have a base price
  const eligible = stocks.filter((s) => s.prices.length > 0)
  if (eligible.length === 0) return

  const count    = Math.min(eligible.length, Math.ceil(randomBetween(1, 3)))
  const selected = pickRandom(eligible, count)

  for (const stock of selected) {
    const current = parseFloat(String(stock.prices[0].price))
    const next    = nextPrice(current)

    await recordPrice(stock.id, next, stock.symbol)
    console.log(`[Simulator] ${stock.symbol}: ₹${current} → ₹${next}`)
  }
}

// ── public API ────────────────────────────────────────────────────────────────

export function startSimulator() {
  if (running) return console.log("[Simulator] Already running")
  running = true
  timer   = setInterval(tick, config.intervalMs)
  console.log(`[Simulator] Started — every ${config.intervalMs}ms, max ±${config.maxChangePercent}%`)
}

export function stopSimulator() {
  if (!running) return console.log("[Simulator] Not running")
  clearInterval(timer!)
  running = false
  timer   = null
  console.log("[Simulator] Stopped")
}

export function getStatus() {
  return { running, intervalMs: config.intervalMs, maxChangePercent: config.maxChangePercent }
}

export function updateSettings(settings: { intervalMs?: number; maxChangePercent?: number }) {
  const wasRunning = running
  if (wasRunning) stopSimulator()
  if (settings.intervalMs)       config.intervalMs       = settings.intervalMs
  if (settings.maxChangePercent) config.maxChangePercent = settings.maxChangePercent
  if (wasRunning) startSimulator()
  return getStatus()
}