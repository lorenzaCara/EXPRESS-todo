import express from 'express';
import prisma from '../prisma/prismaClient.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import validatorMiddleware from '../middlewares/validator.middleware.js';
import { createItemValidator, deleteItemValidator, updateItemValidator } from '../validators/items.validator.js';

const itemsRouter = express.Router();

itemsRouter.get('/items',
    authMiddleware,
    async (req, res) => {   
    //return res.status(500).json([]);
    const { list_id } = req.query; //list_id lo prendo dai query

    try {
        const items = await prisma.item.findMany({
            where: list_id ? { listId: + list_id, List: {userId:req.user.id} } : { List: {userId:req.user.id} }, //controlla se c'è list_id altrimenti mi ritorna jun oggetto vuoto
        });
        res.json(items.map(item => ({ ...item, list_id: item.listId })));
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'impossibile caricare gli items'});
    }
    
    
})

itemsRouter.post('/items',
    authMiddleware,
    validatorMiddleware(createItemValidator),
    async ( req, res ) => {
    const { label, checked, list_id } = req.body;

    try {
        const newItem = await prisma.item.create({
            data: {
                label,
                checked,
                listId: +list_id 
            }
        });
        res.json({...newItem, list_id: newItem.listId});
    } catch (error) {
        res.status(500).json({message: 'impossibile creare l\'item'});
    }
    
})

itemsRouter.put('/items/:id',
    authMiddleware,
    validatorMiddleware(updateItemValidator),
    async (req, res) => {
    const { id } = req.params;
    const { label, checked } = req.body;
    try {
        const updatedItem = await prisma.item.update({
            where: { id: +id },
            data: {
                label,
                checked,
            }
        });
        res.json({ ...updatedItem, list_id: updatedItem.listId });
    } catch (error) {
        res.status(500).json({ message: 'Impossibile modificare l\'item' });
    }
});

itemsRouter.delete('/items/:id',
    authMiddleware,
    validatorMiddleware(deleteItemValidator),
    async (req, res) => {
    const { id } = req.params;
    try {
        const deletedItem = await prisma.item.delete({
            where: { id: +id },
        });
        res.json({ ...deletedItem, list_id: deletedItem.listId });
    } catch (error) {
        res.status(500).json({ message: 'Impossibile eliminare l\'item' });
    }
})

export default itemsRouter;