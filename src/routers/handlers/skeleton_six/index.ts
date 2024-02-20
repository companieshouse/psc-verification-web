import { Request, Response } from "express";
import {
    BaseViewData,
    GenericHandler,
    ViewModel
} from "./../generic";
import logger from "../../../lib/Logger";
import { PrefixedUrls } from "../../../constants";

interface SkeletonSixViewData extends BaseViewData {

}

export class SkeletonSixHandler extends GenericHandler<SkeletonSixViewData> {

    private static templatePath = "router_views/skeleton_six/skeleton_six";

    public getViewData (req: Request): SkeletonSixViewData {

        const baseViewData = super.getViewData(req);

        return {
            ...baseViewData,
            title: "Skeleton Six",
            backURL: PrefixedUrls.START
        };
    }

    public executeGet (
        req: Request,
        _response: Response
    ): ViewModel<SkeletonSixViewData> {
        logger.info(`SkeletonSixHandler execute called`);
        const viewData = this.getViewData(req);

        return {
            templatePath: SkeletonSixHandler.templatePath,
            viewData
        };
    }
}
