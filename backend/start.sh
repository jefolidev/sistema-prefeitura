#!/bin/sh

echo "Instalando dependências..."
npm install

echo "Gerando client Prisma..."
npx prisma generate

echo "Esperando o banco de dados..."
while ! nc -z pg 5432; do
  echo "Ainda não conectou no banco... tentando de novo."
  sleep 1
done

echo "Banco encontrado! Aplicando migrations..."
npx prisma migrate deploy

echo "Subindo aplicação..."
npm start

echo "Aplicação iniciada com sucesso!"

echo "Realizando seed do banco de dados"
npm run db:seed
echo "Seed gerado com sucesso!"