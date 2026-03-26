import jwt from "jsonwebtoken";
import cookie from "cookie";

const authenticateSocket = (socket, next) => {
  let token;

  // Try cookie header first (matches how the REST API auth works)
  const rawCookie = socket.handshake.headers.cookie;
  if (rawCookie) {
    const parsed = cookie.parse(rawCookie);
    token = parsed.token;
  }

  // Fallback: client can pass token via socket.io auth handshake
  if (!token) {
    token = socket.handshake.auth?.token;
  }

  if (!token) {
    return next(new Error("Authentication error: token missing"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "123");
    socket.user = decoded;
    next();
  } catch {
    next(new Error("Authentication error: token invalid or expired"));
  }
};

export default authenticateSocket;
