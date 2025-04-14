import { z } from "zod";
import prisma from '../prisma/prismaClient.js';

const bodyUpsertSchema = z.object({
    title: z
        .string({ required_error: 'Campo richiesto'})
        .min(1, { message: 'Campo richiesto'}),
    description: z.string().optional().nullable(),
    favorite: z.boolean().optional().nullable() //nel db è obbligatorio perchè di default ha false... nel front lo è.
})

export const createListValidator = z.object({
    body:bodyUpsertSchema,
})

export const updateListValidator = ( partial = false ) => z.object({
    body:partial ? bodyUpsertSchema.extend({
        title: z.string().min(1).optional().nullable(),
    }) : bodyUpsertSchema,
    params:z.object({
        id: z.string(),
    })
}).superRefine( async (
    { params },
    ctx
) => {
    const list = await prisma.list.findUnique({
        where: { id: +params.id}
    });

    if(!list) {
        ctx.addIssue({
            code: 'custom',
            message: 'list non trovata',
            path: ['params', 'id'],
        })
    }
})