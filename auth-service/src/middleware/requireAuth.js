import jwt from "jsonwebtoken";
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is missing in environment");
    }
    return secret;
};
export const requireAuth = (req, res, next) => {
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
        const decoded = jwt.verify(token, getJwtSecret());
        if (!decoded.sub) {
            res.status(401).json({ message: "Invalid token" });
            return;
        }
        req.auth = decoded.email ? { userId: decoded.sub, email: decoded.email } : { userId: decoded.sub };
        next();
    }
    catch {
        res.status(401).json({ message: "Invalid token" });
    }
};
