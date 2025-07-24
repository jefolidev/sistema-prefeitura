-- AlterTable
ALTER TABLE "fornecedores" 
    ADD COLUMN "cnpj" TEXT,
    ADD COLUMN "razao_social" TEXT,
    ADD COLUMN "endereco" TEXT,
    ADD COLUMN "email" TEXT,
    ADD COLUMN "telefone" TEXT,
    ADD COLUMN "observacoes" TEXT;
