import { Router } from 'express';
import {  
    DiscordRouter 
} from '.';


class MasterRouter {
    private _router = Router();
    private _discordRouter = DiscordRouter;

    get router() {
        return this._router;
    }

    constructor() {
        this._configure();
    }

    private _configure() {
        this._router.use('/discord', this._discordRouter);
    }
}

export = new MasterRouter().router;