import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getJwtPublicKey, JWT_ALGORITHM } from "../config/jwtKeys.js";

type JwtClaims = {
  sub?: string;
  email?: string;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        email?: string;
      };
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.header("authorization") || req.header("Authorization");
  if (!header) {
    res.status(401).json({ message: "Missing Authorization header" });
    return;
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    res.status(401).json({ message: "Invalid Authorization header" });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtPublicKey(), { algorithms: [JWT_ALGORITHM] }) as JwtClaims;
    if (!decoded.sub) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    req.auth = decoded.email ? { userId: decoded.sub, email: decoded.email } : { userId: decoded.sub };
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
