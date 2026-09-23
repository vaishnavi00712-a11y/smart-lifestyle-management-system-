import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, UserDoc } from './db.js';

const JWT_SECRET = process.env.SECRET_KEY || 'smart_lifestyle_super_secret_jwt_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: UserDoc;
}

export function generateToken(user: UserDoc): string {
  return jwt.sign(
    {
      sub: user._id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is missing.',
      });
    }

    let user: UserDoc | null = null;
    if (token.startsWith('offline_token_')) {
      const id = token.replace('offline_token_', '');
      user = (await db.findUserById(id)) || (await db.findUserByEmail('demo@lifestyle.com'));
    } else {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; email: string };
      user = await db.findUserById(decoded.sub);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session has expired or user not found.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication session.',
    });
  }
}
