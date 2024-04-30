import { HttpStatusCode } from "axios";
import { parse } from "node-html-parser";
import request from "supertest";
import middlewareMocks from "../../../mocks/allMiddleware.mock";
import app from "../../../../src/app";
import { PrefixedUrls } from "../../../../src/constants";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../../src/utils/url";
import { CREATED_RESOURCE, INDIVIDUAL_RESOURCE, PSC_VERIFICATION_ID, RLE_RESOURCE, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";
import { Resource } from "@companieshouse/api-sdk-node";
import { PscVerificationResource } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { getPscVerification } from "../../../../src/services/pscVerificationService";

jest.mock("../../../../src/services/pscVerificationService", () => ({
    getPscVerification: jest.fn()
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

    it.each([[undefined, CREATED_RESOURCE], ["individual", INDIVIDUAL_RESOURCE], ["rle", RLE_RESOURCE]])("Should render the Psc Type page with a success status code and %s radio button checked", async (expectedSelection, resource) => {
        const mockGet: Resource<PscVerificationResource> = {
            httpStatusCode: HttpStatusCode.Ok,
            resource
        };

        mockGetPscVerification.mockResolvedValueOnce(mockGet);

        const resp = await request(app).get(getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_TYPE, TRANSACTION_ID, PSC_VERIFICATION_ID));

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
