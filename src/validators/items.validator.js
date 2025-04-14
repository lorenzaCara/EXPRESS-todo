import { z } from "zod";
import prisma from "../prisma/prismaClient.js";

export const createItemValidator = z.object ({
    body: z.object({
        label: z.string().min(1),
        checked: z.boolean().optional(),
        list_id: z.number(), //scritto con l'underscore perchè dal front ci arriva cosi
    }),
    user: z.object({
        id: z.number()
    })
}).superRefine(async (data, ctx) => {
    try {
        const list = await prisma.list.findUnique({
            where: { 
                id: data.body.list_id,
                userId: data.user.id // perchè l'ho inserito in validator.middleware
            }
        })

        if(!list) {
            ctx.addIssue({
                code: "custom",
                message: "Id lista non valido",
                path: ["body", "list_id"]
            })
        }
    } catch (error) {
        ctx.addIssue({
            code: "custom",
            message: "Id lista non valido",
            path: ["body", "list_id"]
        })
    }
})

export const updateItemValidator = z.object({
    params: z.object({
        id: z.string()
    }),
    body: z.object({
        label: z.string().min(1),
        checked: z.boolean(),
    }),
    user: z.object({
        id: z.number()
    })
}).superRefine(checkItem)

export const deleteItemValidator = z.object({
    params: z.object({
        id: z.string()
    }),
    user: z.object({
        id: z.number()
    })
}).superRefine(checkItem)

//le arrow function vanno necessariamente dichiarate sopra, ovvero prima dell'utilizzo. Se le trasformo in semplici funzioni posso scriverle sotto.
async function checkItem(data, ctx) {
    //devo fare una inner join
    const item = await prisma.item.findUnique({
        where: {
            id: +data.params.id,
            List: {
                userId: data.user.id
            }
        }
    })

    if(!item) {
        ctx.addIssue({
            code: 'custom',
            path: ['params', "id"],
            message: "Item id non valido"
        })
    }
}