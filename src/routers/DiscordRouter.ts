
import { NextFunction, Request, Response, Router } from "express";
import { DiscordController, SismoController } from "../controllers";
import { ServerSettings } from "../utils/types";

class DiscordRouter {
    private _router = Router();
    private _controller = DiscordController;
    private _sismoController = SismoController;

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
            "/verify",
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const result = await this._controller.changeServerStatus(
                        req.body.serverId,
                        req.body.userId,
                        req.body.role,
                        req.body.claims,
                        req.body.sismoConnectResponse
                    )
                    res.status(200).json(result);
                } catch (error) {
                    res.status(500).json(error);
                }
            }
        )

        this._router.post(
            "/setServer",
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    if(!req.body.owner) 
                        throw new Error("owner is required");
                    if(!req.body.servers)
                        throw new Error("server obejct is required");

                    console.log("set new server for owner: ", req.body.owner);
                    const result = await this._controller.setServer(req.body.owner, req.body.servers)
                    res.status(200).json(result);
                } catch (error) {
                    console.log(error)
                    res.status(500).json({
                        error: error.message
                    });
                }
            }
        )

        this._router.get(
            "/getServersByOwner",
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const owner = req.query.owner as string;
                    if(!owner) 
                        throw new Error("owner is required");
        
                    console.log("get servers from owner: ", owner);
                    const result = await this._controller.getServersByOwner(owner)
                    res.status(200).json(result);
                } catch (error) {
                    console.log(error)
                    res.status(500).json({
                        error: error.message
                    });
                }
            }
        )

        this._router.get(
            "/getAllGroups",
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const result = await this._sismoController.getAllGroups();
                    res.status(200).json(result);
                } catch (error) {
                    console.log(error)
                    res.status(500).json({
                        error: error.message
                    });
                }
            }
        )

        this._router.get(
            "/getDiscordRoles",
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const serverId = req.query.serverId as string;
                    const result = await this._controller.getDiscordRoles(serverId);
                    res.status(200).json(result);
                } catch (error) {
                    console.log(error)
                    res.status(500).json({
                        error: error.message
                    });
                }
            }
        )

        this._router.get(
            "/getOwner",
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const serverId = req.query.serverId as string;
                    const result = await this._controller.getServerOwner(serverId);
                    res.status(200).json(result);
                } catch (error) {
                    console.log(error)
                    res.status(500).json({
                        error: error.message
                    });
                }
            }
        )

        this._router.get(
            "/getServerGroupIds",
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const serverId = req.query.serverId as string;
                    const role = req.query.role as string;
                    const result = await this._controller.getServerGroupIds(serverId, role);
                    res.status(200).json(result);
                } catch (error) {
                    console.log(error)
                    res.status(500).json({
                        error: error.message
                    });
                }
            }
        )


    }

}

export = new DiscordRouter().router;