import { VerificationStatement } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { HttpStatusCode } from "axios";
import { parse } from "node-html-parser";
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

        const rootNode = parse(resp.text);
        const backLink = rootNode.querySelector("a.govuk-back-link");
        const statementCheckbox = rootNode.querySelector("input.govuk-checkboxes__input[name=psc_individual_statement]:checked");

        expect(resp.status).toBe(HttpStatusCode.Ok);
        expect(backLink?.getAttribute("href")).toBe("/persons-with-significant-control-verification/transaction/11111-22222-33333/submission/662a0de6a2c6f9aead0f32ab/individual/personal-code?lang=en");
        expect(statementCheckbox?.getAttribute("value")).toBe(VerificationStatement.INDIVIDUAL_VERIFIED);
    });

    it("Should render the Individual Statement page with a success status code, correct links, and correct statement selected", async () => {
        const queryParams = new URLSearchParams("lang=en");
        const uriWithQuery = `${PrefixedUrls.INDIVIDUAL_STATEMENT}?${queryParams}`;
        const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

        const resp = await request(app).get(uri);

        const rootNode = parse(resp.text);
        const backLink = rootNode.querySelector("a.govuk-back-link");
        const nameDiv = rootNode.querySelector("div#nameAndDateOfBirth");
        const statementCheckbox = rootNode.querySelector("input.govuk-checkboxes__input[name=psc_individual_statement]:checked");
        const statementLabel = rootNode.querySelector("label.govuk-checkboxes__label[for='psc_individual_statement']");
        const labelHtmlNormalisedWhitespace = statementLabel?.innerHTML.replace(/[\r\n\t]+/gm, "").replace(/\s+/g, " ").trim();

        expect(resp.status).toBe(HttpStatusCode.Ok);
        expect(backLink?.getAttribute("href")).toBe("/persons-with-significant-control-verification/transaction/11111-22222-33333/submission/662a0de6a2c6f9aead0f32ab/individual/personal-code?lang=en");
        expect(nameDiv?.text).toBe("Sir Forename Middlename Surname (Born April 2000)");
        expect(statementCheckbox?.getAttribute("value")).toBe(VerificationStatement.INDIVIDUAL_VERIFIED);
        expect(labelHtmlNormalisedWhitespace).toBe("<label>I confirm that <strong>Sir Forename Middlename Surname</strong> has verified their identity.</label>");
    });
});
