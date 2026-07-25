import type { MetadataRoute } from "next";

const baseUrl = "https://nishaj.me";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${baseUrl}/projects`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/skills`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
