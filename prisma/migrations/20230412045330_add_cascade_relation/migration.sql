-- DropForeignKey
ALTER TABLE "authenticators" DROP CONSTRAINT "authenticators_service_id_fkey";

-- DropForeignKey
ALTER TABLE "devices" DROP CONSTRAINT "devices_user_id_fkey";

-- DropForeignKey
ALTER TABLE "passwords" DROP CONSTRAINT "passwords_service_id_fkey";

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_user_id_fkey";

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passwords" ADD CONSTRAINT "passwords_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authenticators" ADD CONSTRAINT "authenticators_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
