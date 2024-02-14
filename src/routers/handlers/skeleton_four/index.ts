import { Request, Response } from "express";
import {
    BaseViewData,
    GenericHandler,
    ViewModel
} from "./../generic";
import logger from "../../../lib/Logger";
import { PrefixedUrls } from "../../../constants";

interface SkeletonFourViewData extends BaseViewData {

}

export class SkeletonFourHandler extends GenericHandler<SkeletonFourViewData> {

    private static templatePath = "router_views/skeleton_four/skeleton_four";

    public getViewData (req: Request): SkeletonFourViewData {

        const baseViewData = super.getViewData(req);

        return {
            ...baseViewData,
            title: "Skeleton Four",
            backURL: PrefixedUrls.START
        };
    }

    public executeGet (
        req: Request,
        _response: Response
    ): ViewModel<SkeletonFourViewData> {
        logger.info(`SkeletonFourHandler execute called`);
        const viewData = this.getViewData(req);

        return {
            templatePath: SkeletonFourHandler.templatePath,
            viewData
        };
    }
}
