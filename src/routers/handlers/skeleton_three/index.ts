import { Request, Response } from "express";
import {
    BaseViewData,
    GenericHandler,
    ViewModel
} from "./../generic";
import logger from "../../../lib/Logger";
import { PrefixedUrls } from "../../../constants";

interface SkeletonThreeViewData extends BaseViewData {

}

export class SkeletonThreeHandler extends GenericHandler<SkeletonThreeViewData> {

    private static templatePath = "router_views/skeleton_three/skeleton_three";

    public getViewData (req: Request): SkeletonThreeViewData {

        const baseViewData = super.getViewData(req);

        return {
            ...baseViewData,
            title: "Skeleton Three",
            backURL: PrefixedUrls.START
        };
    }

    public executeGet (
        req: Request,
        _response: Response
    ): ViewModel<SkeletonThreeViewData> {
        logger.info(`SkeletonThreeHandler execute called`);
        const viewData = this.getViewData(req);

        return {
            templatePath: SkeletonThreeHandler.templatePath,
            viewData
        };
    }
}
