import { INDIVIDUAL_DATA, INDIVIDUAL_DATA_RESOURCE, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../mocks/pscVerification.mock";
import * as httpMocks from "node-mocks-http";
import { PrefixedUrls } from "../../src/constants";
import { getCompanyProfile } from "../../src/services/companyProfileService";
import { validCompanyProfile } from "../mocks/companyProfile.mock";
import { fetchCompany } from "../../src/middleware/fetchCompany";

jest.mock("../../src/services/companyProfileService");
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);

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

    it("should retrieve a company profile resource", async () => {
        const req = httpMocks.createRequest(VALID_REQ);
        const res = httpMocks.createResponse({ locals: { submission: { data: INDIVIDUAL_DATA } } });

        await fetchCompany(req, res, mockNext);

        expect(res.locals?.companyProfile).toBe(validCompanyProfile);
        expect(mockNext).toHaveBeenCalled();
        expect(mockGetCompanyProfile).toHaveBeenCalled();

    });

    it("should skip retrieval if companyNumber is missing", async () => {
        const req = httpMocks.createRequest(VALID_REQ);
        const res = httpMocks.createResponse({ locals: { submission: { data: { ...INDIVIDUAL_DATA_RESOURCE, company_number: undefined } } } });

        await fetchCompany(req, res, mockNext);

        expect(res.locals?.companyProfile).toBeUndefined();
        expect(mockNext).toHaveBeenCalled();
        expect(mockGetCompanyProfile).not.toHaveBeenCalled();

    });

    it("should skip retrieval if submission is undefined", async () => {
        const req = httpMocks.createRequest(VALID_REQ);
        const res = httpMocks.createResponse({ locals: { submission: undefined } });

        await fetchCompany(req, res, mockNext);

        expect(res.locals?.companyProfile).toBeUndefined();
        expect(mockNext).toHaveBeenCalled();
        expect(mockGetCompanyProfile).not.toHaveBeenCalled();

    });

    it("should skip retrieval if submission is missing", async () => {
        const req = httpMocks.createRequest(VALID_REQ);
        const res = httpMocks.createResponse();

        await fetchCompany(req, res, mockNext);

        expect(res.locals?.companyProfile).toBeUndefined();
        expect(mockNext).toHaveBeenCalled();
        expect(mockGetCompanyProfile).not.toHaveBeenCalled();

    });
});
