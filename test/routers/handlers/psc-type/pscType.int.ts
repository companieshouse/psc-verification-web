import { HttpStatusCode } from "axios";
import { parse } from "node-html-parser";
import request from "supertest";
import middlewareMocks from "../../../mocks/allMiddleware.mock";
import app from "../../../../src/app";
import { PrefixedUrls } from "../../../../src/constants";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../../src/utils/url";
import { CREATED_RESOURCE, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";
import { getPscVerification } from "../../../../src/services/pscVerificationService";
import { URLSearchParams } from "url";

jest.mock("../../../../src/services/pscVerificationService", () => ({
    getPscVerification: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: CREATED_RESOURCE
    })
}));

const mockGetPscVerification = getPscVerification as jest.Mock;

describe("psc type view", () => {

    beforeEach(() => {
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
        jest.clearAllMocks();
    });

    it.each([[undefined, undefined], ["individual", "pscType=individual"], ["rle", "pscType=rle"]])("Should render the Psc Type page with a success status code and %s radio button checked", async (expectedSelection, expectedQuery) => {
        const queryParams = new URLSearchParams(expectedQuery);
        const uriWithQuery = `${PrefixedUrls.PSC_TYPE}?${queryParams}`;
        const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

        const resp = await request(app).get(uri);

        const rootNode = parse(resp.text);
        const cssSelector = "input[name=pscType]:checked";
        const checkedRadio = rootNode.querySelector(cssSelector);

        expect(resp.status).toBe(HttpStatusCode.Ok);
        if (expectedSelection) {
            expect(checkedRadio?.getAttribute("value")).toEqual(expectedSelection);
        } else {
            expect(rootNode.querySelectorAll(cssSelector)).toHaveLength(0);
        }
    });

});
