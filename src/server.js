import { createApp } from "./app.js";
import { config } from "./security/config.js";

const app = createApp();

app.listen(config.port, "127.0.0.1", () => {
  console.info(`Showcase disponível em http://127.0.0.1:${config.port}`);
});
