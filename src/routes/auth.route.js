import express from 'express';
import prisma from '../prisma/prismaClient.js';
import bcrypt from 'bcrypt';
import JsonWebToken  from 'jsonwebtoken';
import validatorMiddleware from '../middlewares/validator.middleware.js';
import { loginValidator, registerValidator, requestPasswordRecoveryValidator, updatePasswordValidator } from '../validators/auth.validator.js';
import crypto from "crypto";

const authRouter = express.Router();

authRouter.post('/register',
    validatorMiddleware(registerValidator),
    async (req, res) => {
    const { firstName, lastName, email, password} = req.body;

    try {
        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: bcrypt.hashSync(password, 10)
            },
            omit: {
                password:true
            }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({message: 'impossibile registrare l\'utente'});
    }
    
})

//la login è una post perchè comunque invio dei dati
authRouter.post('/login',
    validatorMiddleware(loginValidator),
    async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })

        const pswCheck = bcrypt.compareSync(password,user?.password || '');
        if (!user || !pswCheck) {
            return res.status(401).json({message: 'email o password errati'});
        }

        const {password: psw, ...userWithoutPsw} = user; //cambio nome a password perchè non posso avere due campi con lo stesso nome
        
        const jwt = JsonWebToken.sign(user, process.env.JWT_SECRET, {expiresIn: '1d'});
        
        res.json({jwt, user: userWithoutPsw}); //qui torno lo user senza password
    } catch (error) {
        
    }

})

authRouter.post('/request-password-recovery',
    validatorMiddleware(requestPasswordRecoveryValidator),
    async (req, res) => {
        const { email } = req.body;

        // Controlla se l'utente esiste
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ message: "Nessun account trovato con questa email" });
        }

        // Genera un token di recupero
        const recoveryToken = crypto.randomBytes(20).toString('hex');

        // Salva il token nel db
        await prisma.user.update({
            where: { email },
            data: {
                recovery_code: recoveryToken,
                recovery_date: new Date()
            }
        });

        res.status(200).json({
            message: 'Codice di recupero inviato!',
            recoveryToken,
        });
    }
);

authRouter.post('/update-password', 
    validatorMiddleware(updatePasswordValidator),
    async (req, res) => {
        const { email, recoveryCode, newPassword, newPasswordConfirmation } = req.body;

        // Verifica che psw e conferma siano uguali
        if (newPassword !== newPasswordConfirmation) {
            return res.status(400).json({ message: 'Le password devono essere uguali' });
        }

        // Verifica esistenza utente
        const user = await prisma.user.findFirst({
            where: { email }
        });

        if (!user) {
            return res.status(400).json({ message: 'Email non registrata' });
        }

        // Verifica che il codice di recupero sia valido
        if (user.recovery_code !== recoveryCode) {
            return res.status(400).json({ message: 'Codice di recupero non valido' });
        }

        // Verifica la scadenza del recoveryCode (facoltativo, se necessario)
        const recoveryDate = new Date(user.recovery_date);
        const currentDate = new Date();
        const expirationTime = 15 * 60 * 1000; // 15 minuti
        if (currentDate - recoveryDate > expirationTime) {
            return res.status(400).json({ message: 'Il codice di recupero è scaduto' });
        }

        // Se il codice di recupero è valido, aggiorna la password
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword, recovery_code: null }
        });

        res.status(200).json({ message: 'Password aggiornata con successo' });
    }
);


export default authRouter;