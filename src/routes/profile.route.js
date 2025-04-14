import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import path from 'path';
import {v4 as uuid } from 'uuid'; //importo uuid per generare un id univoco per le immagini
import fs, { appendFile } from 'fs'; //importo fs per creare la cartella se non esiste
import prisma from '../prisma/prismaClient.js';

const acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

const profileRouter = express.Router(); 

const DIRNAME = path.resolve(); //serve per avere il percorso assoluto della cartella in cui si trova il file. Se uso i moduli di node non posso usare __dirname perchè non è definito.

profileRouter.post('/profile/image', authMiddleware, (req, res) => {
    console.log(req.files);

    // in req.file.image, image è il nome del campo del form
    if(Array.isArray(req.files.image)) {
        return res.status(400).json({ message: 'Devi caricare un solo file'});
    }

    if(!acceptedTypes.includes(req.files.image.mimetype)) {
        return res.status(400).json({ message: 'Formato non supportato, si accettano solo' + acceptedTypes.join(',')});
    }
    
    const ext = req.files.image.name.split('.').pop(); //pop() elimina l'ultimo elemento dell'array e lo restituisce. 
    const filename = uuid() + '.' + ext;
    //uuid() genera un id univoco. Se non metto l'estenzione il file non viene caricato

    //req.user.id è l'id dell'utente che ha fatto il login, serve per creare una cartella unica per ogni utente.
    const uploadPath = path.join(
            DIRNAME,
            'uploads',
            'user' + req.user.id,
            filename //_dirname è più sicuro di process.cwd() perchè non dipende da dove viene lanciato il server.
        );

    //fs è un modulo di node.js che permette di interagire con il File System.
    //se ce la cartella aggiunge il file invece se la cartella non ce la cartella viene creata e aggiunge anche il file
    fs.mkdirSync(path.join(
        DIRNAME,
        'uploads',
        'user' + req.user.id
    ), { recursive: true }); //recursive: true serve per creare la cartella se non esiste. Se non esiste la crea, se non esiste non fa nulla. Crea anche le cartelle padre se non esistono.


    //mv sta per move (quello che mpermette di muovere i file dentro la nostra macchina)
    
    try {
        !!req.user.profileImage && fs.rmSync(path.join(DIRNAME, req.user.profileImage)) //se l'utente ha l'immagine profilo la cancello. !! serve a convertire in booleano.
    } catch (error) {
        
    }

    try {
        //mv è un metodo di fileUpload che serve per spostare i file da una cartella ad un'altra.
        req.files.image.mv(uploadPath, async (err) => {
            if (err) {
                throw new Error(err);
            }


            await prisma.user.update({
                where: { id: req.user.id },
                data: {
                    profileImage: uploadPath.replace(DIRNAME, '') //replace(dirname, '') serve per togliere il percorso assoluto e lasciare solo il percorso relativo. In questo modo posso usare lo stesso codice su server diversi
                }
            })

            res.sendFile(uploadPath);
           /*  res.json({ message: 'File caricato!' }); */
        })
    } catch (error) {
        res.status(400).json({ message: err });
    }
});

//il tag img non può settare gli header e quindi non può fare una chiamata autenticata. Quindi non posso usare authMiddleware. 
profileRouter.get('/profile/image', authMiddleware, (req, res) => {
    try {
        res.sendFile(path.join(DIRNAME, req.user.profileImage))
    } catch (error) {
        res.status(400).json({})
    }
})

export default profileRouter;