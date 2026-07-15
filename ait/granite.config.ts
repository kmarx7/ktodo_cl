import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "todocl",
  brand: {
    displayName: "할일·낼돈·살것·생각",
    primaryColor: "#3182F6",
    icon: "", // TODO: 배포 전 실제 앱 아이콘 이미지 주소로 채우기
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
