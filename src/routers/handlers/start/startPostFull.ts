import { Request, Response } from "express";
import { PscVerification, PscVerificationResource } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { BaseViewData, GenericHandler } from "../generic";
import logger from "../../../lib/Logger";
import { createPscVerification } from "services/internal/pscVerificationService";
import { Session } from "@companieshouse/node-session-handler";

export class StartPostHandler extends GenericHandler<BaseViewData> {

    async post (session: Session, req: Request, res: Response, fullJson: string): Promise<PscVerificationResource> {
        logger.debug(`POST full data to psc-verification-api:`);

        const submission: PscVerification = JSON.parse(fullJson);

        try {
            // TODO: Create a new transaction and determine its transactionId

            const resource: PscVerificationResource = await createPscVerification(req, session, "transactionId goes here", submission);

            // TODO: update the transaction; add the saved resource

            return Promise.resolve(resource);
        } catch (e) {
            logger.error(`Create PSC Verification failed: ${e}`);
            return Promise.reject(e);
        }
    }

}
