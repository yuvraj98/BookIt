import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from './errorHandler'
import { supabase } from '../lib/supabase'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    phone: string
    role: 'customer' | 'organiser' | 'admin'
  }
}

export function authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'No token provided', 'UNAUTHORIZED')
  }

  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
      id: string
      phone: string
      role: 'customer' | 'organiser' | 'admin'
    }
    req.user = payload
    next()
  } catch {
    throw new AppError(401, 'Invalid or expired token', 'UNAUTHORIZED')
  }
}

export function requireRole(...roles: Array<'customer' | 'organiser' | 'admin'>) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(403, 'Insufficient permissions', 'FORBIDDEN')
    }
    next()
  }
}
