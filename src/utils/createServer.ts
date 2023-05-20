import express from 'express';
import cors from 'cors';
import { MasterRouter } from './../routers';

require('dotenv').config();

function createServer() {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.use("/api", MasterRouter);

    return app;
}

export default createServer;