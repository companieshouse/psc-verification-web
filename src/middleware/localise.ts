import { LanguageNames, LocalesService } from "@companieshouse/ch-node-utils";
import { env } from "../config/index";
import { NextFunction, Request, Response } from "express";

export const selectLang = (lang?: any): string => {
    if (!lang) {
        return "en"; // Default to English if no language is specified
    }
    switch (lang) {
        case "cy": return "cy";
        case "en":
        default: return "en";
    }
};

const getLocaleInfo = (locales: LocalesService, lang: string) => {
    return {
        languageEnabled: locales.enabled,
        languages: LanguageNames.sourceLocales(locales.localesFolder),
        i18n: locales.i18nCh.resolveNamespacesKeys(lang),
        lang
    };
};

export const getLocalesService = () => LocalesService.getInstance(env.LOCALES_PATH, env.LOCALES_ENABLED === "true");

export function localise (req: Request, res: Response, next: NextFunction) {
    const localesService = getLocalesService();
    const lang = selectLang(req.query.lang);
    const locale = getLocaleInfo(localesService, lang);
    Object.assign(res.locals, locale); // Add locale info to res.locals

    next();
}
