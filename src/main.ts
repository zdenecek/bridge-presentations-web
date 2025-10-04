import { createApp } from "vue";
import App from "./presentations/App.vue";

const debug = import.meta.env.VITE_UI_DEBUG === "true";
if (debug) console.info("UI debug mode enabled");
let useDebugApp = debug;
useDebugApp = false;

const app =  createApp(useDebugApp ? () => import("./presentations/DebugApp.vue") : App);
app.provide("debug", debug);
app.mount("#app");



