import { createServer } from "http";
import { env } from "./config";
import { app } from "./app";
import { initHrSocketServer } from "./realtime/init-hr-socket";

const httpServer = createServer(app);
initHrSocketServer(httpServer);

httpServer.listen(env.API_PORT, env.API_HOST, () => {
  console.log(
    `[TrustLink API] Running on http://${env.API_HOST}:${env.API_PORT} (HTTP + Socket.io)`
  );
});

export { app };
