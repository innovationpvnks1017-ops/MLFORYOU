import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
        "/ws": {
          target: "ws://localhost:8000",
          ws: true,
        },
      },
      port: 3000,
    },
    define: {
      "process.env": env,
    },
  });
};
