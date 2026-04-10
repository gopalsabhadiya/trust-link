import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config";
import { UserRepository } from "../repositories/user.repository";
import { verifyAuthToken } from "../utils/jwt";
import { normalizeHrReviewEmail } from "../utils/hr-review-email";
import { registerHrRealtimeServer } from "./hr-realtime";

const users = new UserRepository();

function readCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const part = cookieHeader
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${name}=`));
  if (!part) return undefined;
  return decodeURIComponent(part.slice(name.length + 1));
}

export function initHrSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin: env.WEB_ORIGIN,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      const token = readCookie(cookieHeader, env.COOKIE_NAME);
      if (!token) {
        next(new Error("Unauthorized"));
        return;
      }
      const payload = verifyAuthToken(token);
      const user = await users.findById(payload.sub);
      if (!user || user.role !== "HR") {
        next(new Error("Forbidden"));
        return;
      }
      const hrEmail = normalizeHrReviewEmail(user.email);
      await socket.join(`hr:${hrEmail}`);
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  registerHrRealtimeServer(io);
  return io;
}
