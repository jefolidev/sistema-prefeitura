import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcrypt";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

(async () => {
    console.log("Seeding database...");
    // Clear existing data
    await prisma.fornecedores.deleteMany();
    await prisma.departamentos.deleteMany();
    await prisma.produtos.deleteMany();
    await prisma.grupos.deleteMany();
    await prisma.relatorios.deleteMany();
    await prisma.relatorioItens.deleteMany();
    await prisma.userPermissions.deleteMany();
    await prisma.permissions.deleteMany();
    await prisma.users.deleteMany();

    console.log("Creating groups")
    await prisma.grupos.create({
        data: {
            id: randomUUID(),
            name: "Materiais Didaticos",
        }
    })

    console.log("Creating providers")
    await prisma.fornecedores.create({
        data: {
            id: randomUUID(),
            name: "Papelaria e Cia",
            cnpj: "12.345.678/0001-90",
            razaoSocial: "Papelaria e Cia LTDA",
            endereco: "Rua Exemplo, 123, São Paulo, SP",
            email: "papelaria@papelaria.com",
            telefone: "11987654321",
        }
    })

    console.log("Creating departments")
    await prisma.departamentos.create({
        data: {
            id: randomUUID(),
            name: "Escola Municipal",
            responsavel: "João da Silva",
            cpf: "123.456.789-00",
        }
    })


    // Create an admin user
    console.log("Creating admin user...");
    const hash = hashSync("admin123", 10);
    await prisma.users.create({
        data: {
            name: "admin",
            surname: "admin",
            username: "admin123",
            email: "admin@example.com",
            isSuperUser: true,
            password: hash,
        }
    }).then(() => {
        console.log("Admin user created successfully.");
    }).catch((error) => {
        console.error("Error creating admin user:", error);
    });

})()
