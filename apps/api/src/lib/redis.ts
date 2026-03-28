import Redis from 'ioredis'
import { logger } from './logger'

let redis: Redis | null = null

export async function connectRedis(): Promise<void> {
  if (!process.env.REDIS_URL) {
    logger.warn('⚠️  REDIS_URL not set — Redis features (seat locking) will be disabled')
    return
  }

  redis = new Redis(process.env.REDIS_URL, {
    lazyConnect: true,
    retryStrategy: (times) => Math.min(times * 200, 3000),
    maxRetriesPerRequest: 3,
  })

  redis.on('error', (err) => logger.error('Redis error:', err))
  redis.on('connect', () => logger.info('✅ Redis connected'))

  await redis.connect()
}

export function getRedis(): Redis {
  if (!redis) throw new Error('Redis not initialised')
  return redis
}

// ─── Seat locking helpers ────────────────────────────────────
const SEAT_LOCK_TTL = 15 * 60 // 15 minutes in seconds
const SEAT_LOCK_PREFIX = 'seat_lock:'

export async function lockSeats(seatIds: string[], userId: string): Promise<boolean> {
  const r = getRedis()
  const keys = seatIds.map((id) => `${SEAT_LOCK_PREFIX}${id}`)
  const pipeline = r.pipeline()

  for (const key of keys) {
    pipeline.set(key, userId, 'EX', SEAT_LOCK_TTL, 'NX')
  }

  const results = await pipeline.exec()
  const allLocked = results?.every(([err, res]) => !err && res === 'OK')

  if (!allLocked) {
    // Rollback — release any locks we did get
    const rollbackPipeline = r.pipeline()
    results?.forEach(([err, res], i) => {
      if (!err && res === 'OK') rollbackPipeline.del(keys[i])
    })
    await rollbackPipeline.exec()
    return false
  }

  return true
}

export async function releaseSeats(seatIds: string[]): Promise<void> {
  const r = getRedis()
  const keys = seatIds.map((id) => `${SEAT_LOCK_PREFIX}${id}`)
  await r.del(...keys)
}

export async function checkSeatLock(seatId: string): Promise<string | null> {
  const r = getRedis()
  return r.get(`${SEAT_LOCK_PREFIX}${seatId}`)
}
