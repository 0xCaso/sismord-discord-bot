import {
    SismoConnect,
    SismoConnectServerConfig,
    SismoConnectVerifiedResult,
    AuthType,
    SismoConnectResponse
} from "@sismo-core/sismo-connect-server";

require('dotenv').config();

const config: SismoConnectServerConfig = {
    // my app id from Sismo Fractory 
    appId: process.env.SISMO_APP_ID as string,
    devMode: {
        enabled: (process.env.DEV_MODE === "LOCAL"),
    }
}

class SismoController {
    private _sismoConnectInstance = SismoConnect(config);

    async verifyResponse(sismoConnectResponse: SismoConnectResponse) {
        const result: SismoConnectVerifiedResult = await this._sismoConnectInstance.verify(
            sismoConnectResponse,
            {
                // proofs in the sismoConnectResponse should be valid
                // with respect to a Vault and Twitter account ownership
                auths: [
                    { authType: AuthType.VAULT }
                ],
                // proofs in the sismoConnectResponse should be valid
                // with respect to a specific group membership
                claims: [
                    { groupId: "0x1cde61966decb8600dfd0749bd371f12" }
                ],
            }
        )

        // vaultId = hash(userVaultSecret, appId).
        // the vaultId is an app-specific, anonymous identifier of a vault
        const vaultId = result.getUserId(AuthType.VAULT)

        return result;
    }

}

export = new SismoController();