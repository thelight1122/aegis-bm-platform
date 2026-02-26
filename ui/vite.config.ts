import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5174,
        strictPort: true,
        headers: {
            "Content-Security-Policy": "frame-ancestors 'self' http://localhost:5173 http://127.0.0.1:5173;"
        }
    }
});
