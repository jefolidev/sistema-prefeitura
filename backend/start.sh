#!/bin/sh

echo "Esperando o banco de dados (Postgres)..."
while ! nc -z pg 5432; do
  echo "Ainda não conectou no banco... tentando de novo."
  sleep 1
done

echo "Esperando o Redis..."
while ! nc -z redis 6379; do
  echo "Ainda não conectou no Redis... tentando de novo."
  sleep 1
done

echo "Banco e Redis prontos! Instalando dependências..."
npm install

echo "Gerando client Prisma..."
npx prisma generate

echo "Aplicando migrations..."
npx prisma migrate deploy

# echo "Rodando seed do Prisma..."
# npm run db:seed

echo "Subindo aplicação..."
npm start

echo "Aplicação iniciada com sucesso!"