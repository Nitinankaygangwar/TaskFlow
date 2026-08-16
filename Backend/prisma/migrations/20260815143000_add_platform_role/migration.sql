-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('platform_admin', 'user');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "platformRole" "PlatformRole" NOT NULL DEFAULT 'user';
