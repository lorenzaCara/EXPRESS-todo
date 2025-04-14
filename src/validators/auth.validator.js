import { z } from "zod";
import prisma from "../prisma/prismaClient.js";

export const registerValidator = z.object({
    body: z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(8)
            .regex(/(?=.*\d)/, { message: 'Inserisci almeno un numero'})
            .regex(/(?=.*[a-z])/, { message: 'Inserisci almeno una minuscola'})
            .regex(/(?=.*[A-Z])/, { message: 'Inserisci almeno una maiuscola'})
            .regex(/[!?@#*%$:;+-£\\|]/, { message: 'Inserisci almeno un carattere speciale'}),
        passwordConfirmation: z.string()
    })
}).superRefine(async (data, ctx) => {
    const user = await prisma.user.findUnique({ 
        where: {
            email: data.body.email
        }
    });

    if(user) {
        console.log(user);
        ctx.addIssue({
            code: 'custom',
            path: ['body', 'email'],
            message: "Email già registrata!"
        })
    }

    if(data.body.password !== data.body.passwordConfirmation) {
        ctx.addIssue({
            code: 'custom',
            path: ['body', 'passwordConfirmation'],
            message: "Le password devono essere uguali"
        })
    }
})

export const loginValidator = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(1)
    })
})

export const requestPasswordRecoveryValidator = z.object({
    body: z.object({
        email: z.string().email(),
    })
})

export const updatePasswordValidator = z.object({
    body: z.object({
        email: z.string().email(),
        recoveryCode: z.string().min(1),  // Recupero token obbligatorio
        newPassword: z.string().min(8)
            .regex(/(?=.*\d)/, { message: 'Inserisci almeno un numero' })
            .regex(/(?=.*[a-z])/, { message: 'Inserisci almeno una minuscola' })
            .regex(/(?=.*[A-Z])/, { message: 'Inserisci almeno una maiuscola' })
            .regex(/[!?@#*%$:;+-£\\|]/, { message: 'Inserisci almeno un carattere speciale' }),
        newPasswordConfirmation: z.string(),
    })
}).superRefine(async (data, ctx) => {
    // Verifica che password e conferma siano uguali
    if (data.body.newPassword !== data.body.newPasswordConfirmation) {
        ctx.addIssue({
            code: 'custom',
            path: ['body', 'newPasswordConfirmation'],
            message: 'Le password devono essere uguali'
        });
    }
});


