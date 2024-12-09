import { LanguageNames, LocalesService, i18nCh } from "@companieshouse/ch-node-utils";
import { env } from "../config/index";
import {
    SHARED_NUNJUCKS_TRANSLATION_NAMESPACES
} from "@companieshouse/ch-node-utils/lib/constants/constants";
import { Localisation } from "../constants";

export const selectLang = (lang: any): string => {
    switch (lang) {
        case "cy": return "cy";
        case "en":
        default: return "en";
    }
};

export const addLangToUrl = (url: string, lang: string | undefined): string => {
    if (lang === undefined || lang === "") {
        return url;
    }
    if (url.includes("?")) {
        return url + "&lang=" + lang;
    } else {
        return url + "?lang=" + lang;
    }
};

export const getLocaleInfo = (locales: LocalesService, lang: string) => {
    return {
        languageEnabled: locales.enabled,
        languages: LanguageNames.sourceLocales(locales.localesFolder),
        i18n: locales.i18nCh.resolveNamespacesKeys(lang),
        lang
    };
};

export const getLocalesService = () => LocalesService.getInstance(env.LOCALES_PATH, env.LOCALES_ENABLED === "true");

export const getLocalisationForView = (lang: string, viewName: string): Record<string, unknown> => {
    const i18n = [...SHARED_NUNJUCKS_TRANSLATION_NAMESPACES, Localisation.COMMON, viewName].reduce(
        (acc, ns) => ({
            ...acc,
            ...i18nCh.getInstance().getResourceBundle(selectLang(lang), ns)
        }),
        {}
    );
    const locales = getLocalesService();

    return {
        languageEnabled: locales.enabled,
        languages: LanguageNames.sourceLocales(locales.localesFolder),
        i18n,
        lang
    };
};
