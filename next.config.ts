import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Разрешаем открывать dev-сервер с телефона в той же Wi-Fi сети (http://192.168.x.x:3000).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
  // Локальная модель эмбеддингов (~290 МБ) не влезает в функцию Vercel и там не используется
  // (см. embeddingsEnabled в src/lib/rag/embeddings.ts) — не тащим её в сборку.
  outputFileTracingExcludes: {
    "/*": [
      "node_modules/onnxruntime-node/**",
      "node_modules/onnxruntime-web/**",
      "node_modules/@huggingface/transformers/**",
      ".cache/**",
      ".data/**",
    ],
  },
};

export default nextConfig;
