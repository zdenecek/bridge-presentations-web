import { createApp } from "vue";
import App from "./presentations/App.vue";
import DebugAppLayout from "./presentations/components/debug/DebugAppLayout.vue";

const debug = import.meta.env.VITE_UI_DEBUG === "true";
if (debug) console.info("UI debug mode enabled");
let useDebugApp = debug;
useDebugApp = false;
const debugApp = DebugAppLayout

const app =  createApp(useDebugApp ? debugApp : App);
app.provide("debug", debug);
app.mount("#app");



