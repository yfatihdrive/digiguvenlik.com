import fs from "fs";
import path from "path";
import { BlogPost } from "./types";

const BLOG_PATH = path.join(process.cwd(), "data", "blog-posts.json");

export function getBlogPosts(): BlogPost[] {
  try {
    if (!fs.existsSync(BLOG_PATH)) return [];
    const raw = fs.readFileSync(BLOG_PATH, "utf-8").trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BlogPost[]) : [];
  } catch {
    return [];
  }
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return getBlogPosts().find((p) => p.slug === slug);
}
