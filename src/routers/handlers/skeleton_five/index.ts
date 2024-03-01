import { Request, Response } from "express";
import {
    BaseViewData,
    GenericHandler,
    ViewModel
} from "./../generic";
import logger from "../../../lib/Logger";
import { PrefixedUrls } from "../../../constants";

interface SkeletonFiveViewData extends BaseViewData {

}

export class SkeletonFiveHandler extends GenericHandler<SkeletonFiveViewData> {

    private static templatePath = "router_views/skeleton_five/skeleton_five";

    public getViewData (req: Request): SkeletonFiveViewData {

        const baseViewData = super.getViewData(req);

        return {
            ...baseViewData,
            title: "Skeleton Five",
            backURL: PrefixedUrls.START
        };
    }

    public executeGet (
        req: Request,
        _response: Response
    ): ViewModel<SkeletonFiveViewData> {
        logger.info(`SkeletonFiveHandler execute called`);
        const viewData = this.getViewData(req);

        return {
            templatePath: SkeletonFiveHandler.templatePath,
            viewData
        };
    }
}
