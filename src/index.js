import { createApp } from "./main.js";
import { NODE_ENV, PORT } from "./utils/config.js";

const config = {
  env: NODE_ENV,
  port: PORT,
};

const app = createApp(config);

app.listen(config.port, () => {
  const server_message = `http://localhost:${config.port}\n`;
  console.log("Servidor Iniciado", server_message);
});
