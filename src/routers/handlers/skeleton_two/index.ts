import { Request, Response } from "express";
import {
    BaseViewData,
    GenericHandler,
    ViewModel
} from "./../generic";
import logger from "../../../lib/Logger";
import { PrefixedUrls } from "../../../constants";

interface SkeletonTwoViewData extends BaseViewData {

}

export class SkeletonTwoHandler extends GenericHandler<SkeletonTwoViewData> {

    private static templatePath = "router_views/skeleton_two/skeleton_two";

    public getViewData (req: Request): SkeletonTwoViewData {

        const baseViewData = super.getViewData(req);

        return {
            ...baseViewData,
            title: "Skeleton Two",
            backURL: PrefixedUrls.START
        };
    }

    public executeGet (
        req: Request,
        _response: Response
    ): ViewModel<SkeletonTwoViewData> {
        logger.info(`SkeletonTwoHandler execute called`);
        const viewData = this.getViewData(req);

        return {
            templatePath: SkeletonTwoHandler.templatePath,
            viewData
        };
    }
}
