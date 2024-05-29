import { HttpStatusCode } from "axios";
import { INDIVIDUAL_RESOURCE, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../mocks/pscVerification.mock";
import * as httpMocks from "node-mocks-http";
import { PrefixedUrls } from "../../src/constants";
import { fetchVerification } from "../../src/middleware/fetchVerification";
import { getPscVerification } from "../../src/services/pscVerificationService";

jest.mock("../../src/services/pscVerificationService");
const mockGetPscVerification = getPscVerification as jest.Mock;
mockGetPscVerification.mockResolvedValueOnce({
    httpStatusCode: HttpStatusCode.Ok,
    resource: INDIVIDUAL_RESOURCE
});

const mockNext = jest.fn();

describe("fetchVerification", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const VALID_REQ: httpMocks.RequestOptions = {
        method: "GET",
        url: PrefixedUrls.PERSONAL_CODE,
        params: {
            transactionId: TRANSACTION_ID,
            submissionId: PSC_VERIFICATION_ID
        },
        query: {
            pscType: "individual"
        }
    };

    it("should retrieve a verification resource", async () => {
        const req = httpMocks.createRequest(VALID_REQ);
        const res = httpMocks.createResponse();

        await fetchVerification(req, res, mockNext);

        expect(res.locals?.submission).toBe(INDIVIDUAL_RESOURCE);
        expect(mockNext).toHaveBeenCalled();
        expect(mockGetPscVerification).toHaveBeenCalled();

    });

    it("should skip retrieval if transactionId is missing", async () => {
        const req = httpMocks.createRequest({ ...VALID_REQ, params: { submissionId: PSC_VERIFICATION_ID } });
        const res = httpMocks.createResponse();

        await fetchVerification(req, res, mockNext);

        expect(res.locals?.submission).toBeUndefined();
        expect(mockNext).toHaveBeenCalled();
        expect(mockGetPscVerification).not.toHaveBeenCalled();

    });

    it("should skip retrieval if submissionId is missing", async () => {
        const req = httpMocks.createRequest({ ...VALID_REQ, params: { transactionId: TRANSACTION_ID } });
        const res = httpMocks.createResponse();

        await fetchVerification(req, res, mockNext);

        expect(res.locals?.submission).toBeUndefined();
        expect(mockNext).toHaveBeenCalled();
        expect(mockGetPscVerification).not.toHaveBeenCalled();

    });
});
