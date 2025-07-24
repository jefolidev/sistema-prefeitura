-- CreateTable
CREATE TABLE "relatorios" (
    "id" TEXT NOT NULL,
    "fornecedor_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_canceled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "relatorios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relatorio_itens" (
    "id" TEXT NOT NULL,
    "relatorio_id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "relatorio_itens_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "relatorios" ADD CONSTRAINT "relatorios_fornecedor_id_fkey" FOREIGN KEY ("fornecedor_id") REFERENCES "fornecedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relatorios" ADD CONSTRAINT "relatorios_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relatorio_itens" ADD CONSTRAINT "relatorio_itens_relatorio_id_fkey" FOREIGN KEY ("relatorio_id") REFERENCES "relatorios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relatorio_itens" ADD CONSTRAINT "relatorio_itens_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
