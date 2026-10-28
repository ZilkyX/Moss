import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Moss",
    short_name: "Moss",
    description: "Simple tools. Powerful possibilities.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F5F2",
    theme_color: "#0B1F16",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
