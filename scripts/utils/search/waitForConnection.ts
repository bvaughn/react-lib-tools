import { createConnection } from "net";

export async function waitForConnection({
  host = "localhost",
  port = 3000,
  retryAttempts = 10,
  retryDelay = 1_000
}: {
  host?: string;
  port?: number;
  retryAttempts?: number;
  retryDelay?: number;
} = {}) {
  console.log(`Waiting for connection ${host}:${port} ...`);

  return new Promise<void>((resolve, reject) => {
    const socket = createConnection({ host, port });
    socket.addListener("connect", () => {
      console.log("Connected");

      socket.destroy();

      resolve();
    });
    socket.addListener("error", () => {
      socket.destroy();

      if (retryAttempts > 1) {
        console.log(`Retrying after ${retryDelay} ms...`);

        setTimeout(() => {
          waitForConnection({
            host,
            port,
            retryAttempts: retryAttempts - 1,
            retryDelay
          }).then(resolve, reject);
        }, retryDelay);
      } else {
        console.error("Host not available");

        process.exit(1);
      }
    });
  });
}
