import { Request, Response } from "express";
import {
    BaseViewData,
    GenericHandler,
    ViewModel
} from "./../generic";
import logger from "../../../lib/Logger";
import { PrefixedUrls } from "../../../constants";

interface SkeletonOneViewData extends BaseViewData {

}

export class SkeletonOneHandler extends GenericHandler<SkeletonOneViewData> {

    private static templatePath = "router_views/skeleton_one/skeleton_one";

    public getViewData (req: Request): SkeletonOneViewData {

        const baseViewData = super.getViewData(req);

        return {
            ...baseViewData,
            title: "Skeleton One",
            backURL: PrefixedUrls.START
        };
    }

    public executeGet (req: Request, _response: Response): ViewModel<SkeletonOneViewData> {
        logger.info(`SkeletonOneHandler execute called`);
        const viewData = this.getViewData(req);

        return {
            templatePath: SkeletonOneHandler.templatePath,
            viewData
        };
    }
}
