import { createApp } from "vue";
import App from "./presentations/App.vue";
import DebugAppCardPositions from "./presentations/components/debug/DebugAppCardPositions.vue";

const debug = import.meta.env.VITE_UI_DEBUG === "true";
if (debug) console.info("UI debug mode enabled");
let useDebugApp = debug;
useDebugApp = false;
const debugApp = DebugAppCardPositions

const app =  createApp(useDebugApp ? debugApp : App);
app.provide("debug", debug);
app.mount("#app");



