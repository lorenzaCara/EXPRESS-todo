import express from 'express';
import itemsRouter from './routes/items.route.js'; //ho docuto inserire manualmente l'estenzione (.js)
import listsRouter from './routes/lists.route.js';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.route.js';
import fileUpload from 'express-fileupload';
import profileRouter from './routes/profile.route.js';

//install npm i dotenv + inserisco questa stringa. Serve nel caso non legga il .env
dotenv.config();

//process.env è un oggetto variabile globale di Node.js che contiene le variabili d'ambiente.

const PORT = process.env.PORT || 3000;

const app = express()
app.use(cors({
    //*=> indica che è autorizzato chiunque.
    origin: process.env.FRONTEND_URL,
    methods: '*'
    //methods: 'GET, POST' ==> QUI POSSO DIRE CHE SONO AUTORIZZATE SOLO LE GET/POST. Se voglio autorizzarli tutti * o semplicemente non lo inserisco. 
}));

//serve per comprendere il json quando gli arriva
app.use(express.json());
app.use(fileUpload({
    limits: {fileSize: 10 * 1024 * 1024}, //10mb 

}));

//Routes
app.use(itemsRouter); //qui importo itemsRouter
app.use(listsRouter); //qui importo listsRouter
app.use(authRouter);
app.use(profileRouter);

app.get('/ping', (req, res) => res.send('pong'));

app.listen(PORT, () => {
    console.log('server in esecuzione sulla porta:' + PORT);
})