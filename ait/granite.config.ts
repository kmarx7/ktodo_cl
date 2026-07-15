import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "todowhat",
  brand: {
    displayName: "할일·낼돈·살것·생각",
    primaryColor: "#3182F6",
    icon: "icon.png", // public/icon.png — 콘솔 등록 시 절대 URL이 필요하면 교체
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
