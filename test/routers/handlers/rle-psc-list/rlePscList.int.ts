import { HttpStatusCode } from "axios";
import { parse } from "node-html-parser";
import request from "supertest";
import { URLSearchParams } from "url";
import middlewareMocks from "../../../mocks/allMiddleware.mock";
import app from "../../../../src/app";
import { PrefixedUrls } from "../../../../src/constants";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../../src/utils/url";
import { PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";

describe("rle PSC list view", () => {

    beforeEach(() => {
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
        jest.clearAllMocks();
    });

    it("Should render the RLE PSC List page with a success status code and correct links", async () => {
        const queryParams = new URLSearchParams("lang=en&pscType=rle");
        const uriWithQuery = `${PrefixedUrls.RLE_LIST}?${queryParams}`;
        const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

        const resp = await request(app).get(uri);

        const rootNode = parse(resp.text);
        const cssSelector = "a.govuk-back-link";
        const backLink = rootNode.querySelector(cssSelector);

        expect(resp.status).toBe(HttpStatusCode.Ok);
        expect(backLink?.getAttribute("href")).toBe("/persons-with-significant-control-verification/transaction/11111-22222-33333/submission/662a0de6a2c6f9aead0f32ab/psc-type?lang=en&pscType=rle");
    });

});
