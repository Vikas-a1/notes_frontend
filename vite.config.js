import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), "");
  const apiUrl =
    process.env.VITE_API_URL || fileEnv.VITE_API_URL || "http://localhost:8000";

  return {
    plugins: [react()],
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(apiUrl),
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
    },
  };
});
