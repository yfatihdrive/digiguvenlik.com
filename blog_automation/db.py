# -*- coding: utf-8 -*-
"""Yerel SQLite veritabanı yönetimi ve ürün/makale geçmişi takibi."""

import json
import sqlite3
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import config

def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(config.SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db() -> None:
    """Veritabanı tablolarını oluşturur."""
    with get_conn() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS categories (
                slug TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                parent_slug TEXT,
                description TEXT,
                count INTEGER DEFAULT 0,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY,
                sku TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                category_slug TEXT NOT NULL,
                price REAL NOT NULL,
                old_price REAL NOT NULL,
                stock INTEGER NOT NULL,
                rating REAL DEFAULT 5.0,
                review_count INTEGER DEFAULT 0,
                image TEXT NOT NULL,
                short_description TEXT,
                highlights_json TEXT,
                specs_json TEXT,
                is_active INTEGER DEFAULT 1,
                usage_count INTEGER DEFAULT 0,
                last_used_at TEXT,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS articles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slug TEXT UNIQUE NOT NULL,
                title TEXT UNIQUE NOT NULL,
                primary_keyword TEXT NOT NULL,
                secondary_keywords_json TEXT NOT NULL,
                topic_type TEXT NOT NULL,
                category_slug TEXT NOT NULL,
                product_slugs_json TEXT NOT NULL,
                status TEXT NOT NULL,
                word_count INTEGER NOT NULL,
                meta_title TEXT NOT NULL,
                meta_description TEXT NOT NULL,
                content_html TEXT NOT NULL,
                plain_text TEXT NOT NULL,
                images_json TEXT NOT NULL,
                faqs_json TEXT NOT NULL,
                schema_json TEXT NOT NULL,
                quality_notes TEXT,
                created_at TEXT NOT NULL,
                published_at TEXT
            );

            CREATE TABLE IF NOT EXISTS run_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                run_at TEXT NOT NULL,
                mode TEXT NOT NULL,
                status TEXT NOT NULL,
                topic_type TEXT,
                article_slug TEXT,
                product_slugs_json TEXT,
                message TEXT,
                details_json TEXT
            );
            """
        )

def sync_catalog_from_site_db() -> Dict[str, int]:
    """data/db.json dosyasından ürün ve kategorileri SQLite içine senkronize eder."""
    init_db()
    data = json.loads(config.SITE_DB_JSON.read_text(encoding="utf-8"))
    now = datetime.now(timezone.utc).isoformat()
    cat_count = 0
    prod_count = 0

    with get_conn() as conn:
        for cat in data.get("categories", []):
            conn.execute(
                """
                INSERT INTO categories (slug, name, parent_slug, description, count, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(slug) DO UPDATE SET
                    name = excluded.name,
                    parent_slug = excluded.parent_slug,
                    description = excluded.description,
                    count = excluded.count,
                    updated_at = excluded.updated_at
                """,
                (
                    cat["slug"],
                    cat["name"],
                    cat.get("parentSlug"),
                    cat.get("description", ""),
                    int(cat.get("count", 0)),
                    now,
                ),
            )
            cat_count += 1

        # Mevcut JSON makalelerinden usage_count koruyarak ürünleri güncelle
        for prod in data.get("products", []):
            is_active = 1 if int(prod.get("stock", 0)) > 0 else 0
            conn.execute(
                """
                INSERT INTO products (
                    id, sku, slug, name, category, category_slug,
                    price, old_price, stock, rating, review_count, image,
                    short_description, highlights_json, specs_json,
                    is_active, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(slug) DO UPDATE SET
                    id = excluded.id,
                    sku = excluded.sku,
                    name = excluded.name,
                    category = excluded.category,
                    category_slug = excluded.category_slug,
                    price = excluded.price,
                    old_price = excluded.old_price,
                    stock = excluded.stock,
                    rating = excluded.rating,
                    review_count = excluded.review_count,
                    image = excluded.image,
                    short_description = excluded.short_description,
                    highlights_json = excluded.highlights_json,
                    specs_json = excluded.specs_json,
                    is_active = excluded.is_active,
                    updated_at = excluded.updated_at
                """,
                (
                    int(prod["id"]),
                    prod["sku"],
                    prod["slug"],
                    prod["name"],
                    prod["category"],
                    prod["categorySlug"],
                    float(prod["price"]),
                    float(prod.get("oldPrice", prod["price"])),
                    int(prod.get("stock", 0)),
                    float(prod.get("rating", 5.0)),
                    int(prod.get("reviewCount", 0)),
                    prod["image"],
                    prod.get("shortDescription", ""),
                    json.dumps(prod.get("highlights", []), ensure_ascii=False),
                    json.dumps(prod.get("specs", []), ensure_ascii=False),
                    is_active,
                    now,
                ),
            )
            prod_count += 1

    return {"categories": cat_count, "products": prod_count}

def get_existing_articles(include_dry_run: bool = False) -> List[Dict[str, Any]]:
    with get_conn() as conn:
        if include_dry_run:
            rows = conn.execute("SELECT * FROM articles ORDER BY id DESC").fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM articles WHERE status IN ('published', 'draft') ORDER BY id DESC"
            ).fetchall()
        return [dict(r) for r in rows]

def save_article(article: Dict[str, Any]) -> None:
    now = datetime.now(timezone.utc).isoformat()
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO articles (
                slug, title, primary_keyword, secondary_keywords_json, topic_type,
                category_slug, product_slugs_json, status, word_count,
                meta_title, meta_description, content_html, plain_text,
                images_json, faqs_json, schema_json, quality_notes,
                created_at, published_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(slug) DO UPDATE SET
                status = excluded.status,
                word_count = excluded.word_count,
                meta_title = excluded.meta_title,
                meta_description = excluded.meta_description,
                content_html = excluded.content_html,
                plain_text = excluded.plain_text,
                images_json = excluded.images_json,
                faqs_json = excluded.faqs_json,
                schema_json = excluded.schema_json,
                quality_notes = excluded.quality_notes,
                published_at = excluded.published_at
            """,
            (
                article["slug"],
                article["title"],
                article["primary_keyword"],
                json.dumps(article["secondary_keywords"], ensure_ascii=False),
                article["topic_type"],
                article["category_slug"],
                json.dumps(article["product_slugs"], ensure_ascii=False),
                article["status"],
                int(article["word_count"]),
                article["meta_title"],
                article["meta_description"],
                article["content_html"],
                article["plain_text"],
                json.dumps(article["images"], ensure_ascii=False),
                json.dumps(article["faqs"], ensure_ascii=False),
                json.dumps(article["schema_json"], ensure_ascii=False),
                article.get("quality_notes", ""),
                article.get("created_at", now),
                article.get("published_at"),
            ),
        )
        # Sadece gerçek yayında veya dry-run testinde ürün kullanım sayacını güncelle
        if article["status"] == "published":
            for p_slug in article["product_slugs"]:
                conn.execute(
                    """
                    UPDATE products
                    SET usage_count = usage_count + 1, last_used_at = ?
                    WHERE slug = ?
                    """,
                    (now, p_slug),
                )

def log_run(
    mode: str,
    status: str,
    topic_type: str = "",
    article_slug: str = "",
    product_slugs: Optional[List[str]] = None,
    message: str = "",
    details: Optional[Dict[str, Any]] = None,
) -> None:
    now = datetime.now(timezone.utc).isoformat()
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO run_logs (run_at, mode, status, topic_type, article_slug, product_slugs_json, message, details_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                now,
                mode,
                status,
                topic_type,
                article_slug,
                json.dumps(product_slugs or [], ensure_ascii=False),
                message,
                json.dumps(details or {}, ensure_ascii=False),
            ),
        )
