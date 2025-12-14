import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtUser {
    ID: number;
    USERNMAE: string;
}

export interface AuthRequest extends Request {
    user?: JwtUser;
}

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, "jwtsecret") as JwtUser;
        req.user = decoded;

        next();
    }
    catch {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};
