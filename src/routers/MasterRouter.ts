import { Router } from 'express';
import {  
    DiscordRouter,
    // SismoRouter
} from '.';

class MasterRouter {
    private _router = Router();
    private _discordRouter = DiscordRouter;
    // private _sismoRouter = SismoRouter;

    get router() {
        return this._router;
    }

    constructor() {
        this._configure();
    }

    private _configure() {
        this._router.use("/discord", this._discordRouter);
        // this._router.use("/sismo", this._sismoRouter);
    }
}

export = new MasterRouter().router;