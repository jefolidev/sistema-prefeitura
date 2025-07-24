-- AddForeignKey
ALTER TABLE "relatorios" ADD CONSTRAINT "relatorios_retirado_por_fkey" FOREIGN KEY ("retirado_por") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
