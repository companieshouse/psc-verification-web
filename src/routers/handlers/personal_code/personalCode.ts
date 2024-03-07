import { Request, Response } from "express";
import {
    BaseViewData,
    GenericHandler,
    ViewModel
} from "../generic";
import logger from "../../../lib/Logger";
import { PrefixedUrls } from "../../../constants";
import { selectLang, getLocalesService, getLocaleInfo } from "../../../utils/localise";

interface PersonalCodeViewData extends BaseViewData {

}

export class PersonalCodeHandler extends GenericHandler<PersonalCodeViewData> {

  private static templatePath = "router_views/personal_code/personal_code";

  public getViewData (req: Request): BaseViewData {

      const baseViewData = super.getViewData(req);
      const lang = selectLang(req.query.lang);
      const locales = getLocalesService();

      return {
          ...baseViewData,
          ...getLocaleInfo(locales, lang),
          currentUrl: PrefixedUrls.PERSONAL_CODE,
          backURL: PrefixedUrls.SKELETON_THREE
      };
  }

  public executeGet (
      req: Request,
      _response: Response
  ): ViewModel<PersonalCodeViewData> {
      logger.info(`PersonalCodeHandler execute called`);
      const viewData = this.getViewData(req);

      return {
          templatePath: PersonalCodeHandler.templatePath,
          viewData
      };
  }
}
