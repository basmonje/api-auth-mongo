import { createApp } from "./main.js";
import { config } from "./utils/config.js";

const app = createApp(config);

app.listen(config.PORT, () => {
  const server_message = `http://localhost:${config.PORT}\n`;
  console.log("Servidor Iniciado", server_message);
});
