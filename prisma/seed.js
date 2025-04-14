import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient(); //PrismaClient è una classe che mi permette di interaggire con il db.

async function main() {
    const users = [
        {
            email: 'mario.rossi@example.com',
            lastName: 'Rossi',
            firstName: 'Mario',
            password: bcrypt.hashSync('Psw1234!', 10),
        },
        ...new Array(9).fill("").map(() => ({
            email: faker.internet.email(),
            lastName: faker.person.lastName(),
            firstName: faker.person.firstName(),
            password: bcrypt.hashSync('Psw1234!', 10),
        }))
    ];

    for (const user of users) {
        const newUser = await prisma.user.create({ data: user });
        for (let i = 0; i < 10; i++) {
            await prisma.list.create({
                data: {
                    title: faker.lorem.words(),
                    description: faker.lorem.words(5),
                    favorite: faker.datatype.boolean(),
                    userId: newUser.id,
                    items: {
                        create: new Array(Math.floor(Math.random() * 20) + 20)
                            .fill("")
                            .map(() => ({
                                label: faker.lorem.words(),
                                checked: faker.datatype.boolean(),
                            }))
                    }
                }
            })
        }
    }
}
main();