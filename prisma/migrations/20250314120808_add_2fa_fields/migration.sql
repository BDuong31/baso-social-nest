-- AlterTable
ALTER TABLE "users" ADD COLUMN     "f2a_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "f2a_secret" VARCHAR(255);
