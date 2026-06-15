-- AlterTable
ALTER TABLE "comments" ADD COLUMN "image_url" TEXT;

-- AlterTable
ALTER TABLE "recipe_instructions" ADD COLUMN "media_type" TEXT;
ALTER TABLE "recipe_instructions" ADD COLUMN "media_url" TEXT;

-- CreateTable
CREATE TABLE "recipe_images" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recipe_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "recipe_images_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
