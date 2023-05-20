
import { NextFunction, Request, Response, Router } from "express";
import { DiscordController } from "../controllers";

class DiscordRouter {
    private _router = Router();
    private _controller = DiscordController;

    get router() {
        return this._router;
    }

    constructor() {
        this._configure();
    }

    private _configure() {
        this._router.get("/", (
            req: Request,
            res: Response,
            next: NextFunction
        ) => {
            res.status(200).json({ ping: "discord pong" });
        });

        this._router.post(
            "/verifyResponse",
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const sismoResponse = req.body.response;
                    const result = await this._controller.doSomething(sismoResponse)
                    res.status(200).json(result);
                } catch (error) {
                    res.status(500).json(error);
                }
            })
    }

}

export = new DiscordRouter().router;