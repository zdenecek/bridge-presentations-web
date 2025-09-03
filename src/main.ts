import { createApp } from "vue";
import App from "./presentations/App.vue";
// import DebugApp from "./presentations/DebugApp.vue";

// createApp(DebugApp).mount("#app");
const app = createApp(App);

const debug = import.meta.env.VITE_UI_DEBUG === "true";
app.provide("debug", debug);
if (debug) {
  console.info("UI debug mode enabled");
}

app.mount("#app");
