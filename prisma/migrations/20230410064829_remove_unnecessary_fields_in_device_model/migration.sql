/*
  Warnings:

  - You are about to drop the column `token` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `devices` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "devices" DROP COLUMN "token",
DROP COLUMN "verified";
