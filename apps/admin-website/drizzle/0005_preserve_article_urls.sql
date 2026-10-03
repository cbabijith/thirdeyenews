CREATE TABLE IF NOT EXISTS "news_slug_aliases" (
  "slug" text PRIMARY KEY NOT NULL,
  "news_id" uuid NOT NULL REFERENCES "news"("id") ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "news_slug_aliases_news_id_idx" ON "news_slug_aliases" ("news_id");
--> statement-breakpoint
INSERT INTO "news_slug_aliases" ("slug", "news_id")
SELECT "slug", "id" FROM "news" WHERE "slug" IS NOT NULL AND "slug" <> ''
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
ALTER TABLE "news_slug_aliases" ENABLE ROW LEVEL SECURITY;
