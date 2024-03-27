import { Request, Response } from "express";
import {
    BaseViewData,
    GenericHandler,
    ViewModel
} from "./generic";
import logger from "../../lib/Logger";
import { PrefixedUrls } from "../../constants";
import { selectLang, getLocalesService, getLocaleInfo } from "../../utils/localise";
import { PscVerification, PscVerificationResource } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { Session } from "@companieshouse/node-session-handler";

interface FullRecordViewData extends BaseViewData {
    statusTag: {
        status: string,
        colour: string
    }
}

export default class FullRecordHandler extends GenericHandler<FullRecordViewData> {

    private static templatePath = "router_views/spike_full_record";

    public async getViewData (req: Request): Promise<FullRecordViewData> {

        const baseViewData = await super.getViewData(req);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const status = req.query?.status as string ?? "READY";
        const statusColour = req.query?.statusColour as string ?? "govuk-tag--blue";

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            statusTag: { status: status, colour: statusColour },
            currentUrl: PrefixedUrls.FULL_RECORD,
            backURL: PrefixedUrls.CONFIRM_COMPANY
        };
    }

    public async executeGet (
        req: Request,
        _response: Response
    ): Promise<ViewModel<FullRecordViewData>> {
        logger.info(`FullRecordHandler execute called`);
        const viewData = await this.getViewData(req);

        return {
            templatePath: FullRecordHandler.templatePath,
            viewData
        };
    }

    public async executePost (session: Session, req: Request, res: Response, fullJson: string): Promise<PscVerificationResource> {
        logger.debug(`POST full data to psc-verification-api:`);

        const submission: PscVerification = JSON.parse(fullJson);

        try {
            // TODO: Create a new transaction and determine its transactionId

            // const resource: PscVerificationResource = await createPscVerification(req, session, "transactionId goes here", submission);
            const resource = {} as PscVerificationResource; // TODO: empty resource for now

            // TODO: update the transaction; add the saved resource

            return Promise.resolve(resource);
        } catch (e) {
            logger.error(`Create PSC Verification failed: ${e}`);
            return Promise.reject(e);
        }
    }

}
