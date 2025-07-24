import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcrypt";

const prisma = new PrismaClient();


(async () => {
    console.log("Seeding database...");
    // Clear existing data
    await prisma.users.deleteMany();
    await prisma.fornecedores.deleteMany();
    await prisma.departamentos.deleteMany();
    await prisma.produtos.deleteMany();
    await prisma.grupos.deleteMany();
    await prisma.relatorios.deleteMany();
    await prisma.relatorioItens.deleteMany();
    
    // Create an admin user
    console.log("Creating admin user...");
    const hash = hashSync("admin123", 10);
    await prisma.users.create({
        data: {
            name: "admin",
            surname: "admin",
            username: "admin123",
            email: "admin@example.com",
            password: hash,
        }
    }).then(() => {
        console.log("Admin user created successfully.");
    }).catch((error) => {
        console.error("Error creating admin user:", error);
    });

})()
