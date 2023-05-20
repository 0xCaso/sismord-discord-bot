import {
    SismoConnect,
    SismoConnectServerConfig,
    SismoConnectVerifiedResult,
    AuthType,
    SismoConnectResponse
} from "@sismo-core/sismo-connect-server";

const config: SismoConnectServerConfig = {
    // my app id from Sismo Fractory 
    appId: process.env.SISMO_APP_ID || "",
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
                    { groupId: "0x42c768bb8ae79e4c5c05d3b51a4ec74a" }
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