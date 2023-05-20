
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
                    const sismoResponse = req.body.sismoConnectResponse;
                    const result = await this._controller.doSomething(sismoResponse)
                    res.status(200).json(result);
                } catch (error) {
                    res.status(500).json(error);
                }
            }
        )

        this._router.get(
            "/getGroups",
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const serverId = req.query.serverId as string;
                    if(!serverId) 
                        throw new Error("serverId is required");
                    
                    console.log("get groups for serverId: ", serverId);
                    const result = await this._controller.getGroupsIds(serverId)
                    res.status(200).json(result);
                } catch (error) {
                    console.log(error)
                    res.status(500).json({
                        error: error.message
                    });
                }
            }
        )

        this._router.post(
            "/setGroups",
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const serverId = req.body.serverId as string;
                    const groupIds = req.body.groupIds as Array<string>;
                    console.log(serverId, groupIds)
                    if(!serverId) 
                        throw new Error("serverId is required");
                    if(!groupIds)
                        throw new Error("groupIds array is required");
                    
                    console.log("set new group for serverId: ", serverId);
                    const result = await this._controller.setGroupIds(serverId, groupIds)
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
            "/getServers",
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const ownerId = req.query.ownerId as string;
                    if(!ownerId) 
                        throw new Error("ownerId is required");
                    
                    console.log("get servers for ownerId: ", ownerId);
                    const result = await this._controller.getServerIds(ownerId);
                    res.status(200).json(result);
                } catch (error) {
                    console.log(error)
                    res.status(500).json({
                        error: error.message
                    });
                }
            }
        )

        this._router.post(
            "/setServers",
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const ownerId = req.body.ownerId as string;
                    const serverIds = req.body.serverIds as Array<string>;
                    console.log(ownerId, serverIds)
                    if(!serverIds) 
                        throw new Error("serverIds array is required");
                    if(!ownerId)
                        throw new Error("ownerId is required");
                    
                    console.log("set new servers for ownerId: ", ownerId);
                    const result = await this._controller.setServerIds(ownerId, serverIds);
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