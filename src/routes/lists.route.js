import express from 'express';
import prisma from '../prisma/prismaClient.js';
import validatorMiddleware from '../middlewares/validator.middleware.js';
import { createListValidator, updateListValidator } from '../validators/lists.validator.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';


const listsRouter = express.Router();

listsRouter.post('/lists', 
    authMiddleware,
    validatorMiddleware(createListValidator), 
    async (req, res) => {
    const { title, description, favorite } = req.body;
    //await si usa solo quando ho delle promise
    try {
        const newList = await prisma.list.create({
            data: {
                title,
                description,
                favorite,
                userId: req.user.id
        }})
        res.json(newList);
    } catch (error) {
        res.status(500).json({message: 'lista non creata!'});
    }
})

listsRouter.get('/lists',
    authMiddleware,
    async (req, res) => {
    //return res.status(500).json([]);
    //return res.status(200).json([]);
    try {
        const lists = await prisma.list.findMany({
            orderBy: {
                createdAt: 'asc', 
            },
            where: {
                userId: req.user.id
            }
        })
        res.json(lists);
    } catch (error) {
        res.status(500).json({message: 'impossibile caricare le liste!'});
    }
})

listsRouter.get('/lists/:id',
    authMiddleware,
    async (req,res) => {
    const { id } = req.params; //params sono quelli che si trovano dopo /:
    try {
        const list = await prisma.list.findUnique({
            where: { 
                id: +id,
                userId: req.user.id
             } // +id serve a trasformare una stringa in un numero
        })
        if (!list) {
            return res.status(404).json({message: 'not found!'}); //qui devo mettere il return, non posso inserire due volte res ==> ovvero non posso rispondere più volte al client
        }
        res.json(list);
    } catch (error) {
        res.status(500).json({message: 'impossibile caricare la lista!'});
    }
})

//funzione che torna una funzione per distinguere put da patch
const updateList = (partial = false) => async (req, res) => {
    const { id } = req.params;
    const { title, description, favorite } = req.body;
    
    try {
        const updatedList = await prisma.list.update({
            where: { id: +id, userId: req.user.id },
            data: {
                //title è l'unico che è obbligatorio quindi non lo gestisco nel caso in cui non lo modifico.
                title,
                //per gestire put e patch. Se non inserisco una descrizione e sto facendo una put mi torna null, se non inserisco nulla ed è una patch mi da undefined
                description: description || (partial ? undefined : null),
                favorite: partial ? favorite : !!favorite //converto favorite in booleano
            }
        })
        res.json(updatedList);
    } catch (error) {
        res.status(500).json({message: 'impossibile aggiornare la lista!'});
    }
}

listsRouter.put('/lists/:id', validatorMiddleware(updateListValidator()), authMiddleware, updateList());
listsRouter.patch('/lists/:id', validatorMiddleware(updateListValidator(true)), authMiddleware, updateList(true));

listsRouter.delete('/lists/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const deleteList = await prisma.list.delete({
            where: { id: +id, userId: req.user.id }
        })
        res.json(deleteList);
    } catch (error) {
        res.status(500).json({message: 'impossibile eliminare la lista!'});
    }
})

export default listsRouter;