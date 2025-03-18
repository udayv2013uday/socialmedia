import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import session from "express-session";

// Extend the session interface
declare module "express-session" {
  interface Session {
    userId?: number;
  }
}

// Middleware to check if the user is authenticated and set the user in req
export function auth(req: Request, res: Response, next: NextFunction) {
  const { userId } = req.session;
  
  if (userId) {
    storage.getUser(userId)
      .then(user => {
        if (user) {
          // Remove sensitive information and convert null values to undefined
          const { password, ...rest } = user;
          const userInfo = {
            ...rest,
            bio: rest.bio ?? undefined,
            website: rest.website ?? undefined
          };
          req.user = userInfo;
        }
        next();
      })
      .catch(err => {
        console.error("Authentication error:", err);
        next();
      });
  } else {
    next();
  }
}

// Middleware to ensure a user is authenticated
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Compare a password with a hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}