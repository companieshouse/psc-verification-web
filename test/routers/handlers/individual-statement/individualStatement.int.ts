import { HttpStatusCode } from "axios";
import * as cheerio from "cheerio";
import request from "supertest";
import { URLSearchParams } from "url";
import middlewareMocks from "../../../mocks/allMiddleware.mock";
import app from "../../../../src/app";
import { PrefixedUrls } from "../../../../src/constants";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../../src/utils/url";
import { PSC_INDIVIDUAL } from "../../../mocks/psc.mock";
import { INDIVIDUAL_RESOURCE, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";

jest.mock("../../../../src/services/pscVerificationService", () => ({
    getPscVerification: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: INDIVIDUAL_RESOURCE
    })
}));
jest.mock("../../../../src/services/pscService", () => ({
    getPscIndividual: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: PSC_INDIVIDUAL
    })
}));

describe("individual statement view", () => {

    beforeEach(() => {
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
        jest.clearAllMocks();
    });

    it("Should render the Individual Statement page with a success status code, correct links, and correct statement selected", async () => {
        const queryParams = new URLSearchParams("lang=en");
        const uriWithQuery = `${PrefixedUrls.INDIVIDUAL_STATEMENT}?${queryParams}`;
        const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

        const resp = await request(app).get(uri);

        const $ = cheerio.load(resp.text);

        expect(resp.status).toBe(HttpStatusCode.Ok);
        expect($("a.govuk-back-link").attr("href")).toBe("/persons-with-significant-control-verification/transaction/11111-22222-33333/submission/662a0de6a2c6f9aead0f32ab/individual/personal-code?lang=en");
        expect($("div#nameAndDateOfBirth").text()).toBe("Sir Forename Middlename Surname (Born April 2000)");
        expect($("input.govuk-checkboxes__input[name=psc_individual_statement]").prop("checked")).toBe(true);
        // expect emphasis applied to PSC name
        expect(normalizeWhitespace($("label.govuk-checkboxes__label[for='psc_individual_statement']").html())).toBe("<label>I confirm that <strong>Sir Forename Middlename Surname</strong> has verified their identity.</label>");
    });
});

const normalizeWhitespace = (html: string | null): string | null => html?.replace(/[\r\n\t]+/gm, "").replace(/\s+/g, " ").trim() || null;
