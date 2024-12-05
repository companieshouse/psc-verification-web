import { Response } from "express";
import * as httpMocks from "node-mocks-http";
import { PrefixedUrls } from "../../src/constants";
import { COMPANY_NUMBER, INDIVIDUAL_DATA, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../mocks/pscVerification.mock";
import { getCompanyProfile } from "../../src/services/companyProfileService";
import { validCompanyProfile } from "../mocks/companyProfile.mock";
import { fetchCompany } from "../../src/middleware/fetchCompany";

jest.mock("../../src/services/companyProfileService");
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);

const mockNext = jest.fn();

describe("fetchCompany", () => {
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

    describe("should retrieve a company profile resource", () => {

        it("when the submission has a companyNumber", async () => {
            const req = httpMocks.createRequest(VALID_REQ);
            const res = httpMocks.createResponse({ locals: { submission: { data: INDIVIDUAL_DATA } } });

            await fetchCompany(req, res, mockNext);

            expectValidProfileFetched(res);
        });

        it("when the submission is missing and companyNumber query param is provided", async () => {
            const req = httpMocks.createRequest({ ...VALID_REQ, query: { companyNumber: COMPANY_NUMBER } });
            const res = httpMocks.createResponse({ locals: { submission: undefined } });

            await fetchCompany(req, res, mockNext);

            expectValidProfileFetched(res);
        });

        it("when the submission has no companyNumber and companyNumber query param is provided", async () => {
            const req = httpMocks.createRequest({ ...VALID_REQ, query: { companyNumber: COMPANY_NUMBER } });
            const res = httpMocks.createResponse({ locals: { submission: { data: { ...INDIVIDUAL_DATA, companyNumber: undefined } } } });

            await fetchCompany(req, res, mockNext);

            expectValidProfileFetched(res);
        });

    });

    describe("should skip retrieval", () => {
        it("when submission is missing and companyNumber query param not provided", async () => {
            const req = httpMocks.createRequest(VALID_REQ);
            const res = httpMocks.createResponse({ locals: { submission: undefined } });

            await fetchCompany(req, res, mockNext);

            expect(res.locals?.companyProfile).toBeUndefined();
            expect(mockNext).toHaveBeenCalled();
            expect(mockGetCompanyProfile).not.toHaveBeenCalled();

        });
    });

});

const expectValidProfileFetched = (res: httpMocks.MockResponse<Response<any, Record<string, any>>>) => {
    expect(res.locals?.companyProfile).toBe(validCompanyProfile);
    expect(mockNext).toHaveBeenCalled();
    expect(mockGetCompanyProfile).toHaveBeenCalled();
};
