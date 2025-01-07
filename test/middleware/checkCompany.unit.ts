
import * as httpMocks from "node-mocks-http";
import { HttpStatusCode } from "axios";
import { PrefixedUrls } from "../../src/constants";
import { checkCompany } from "../../src/middleware/checkCompany";
import { COMPANY_NUMBER, validCompanyProfile } from "../mocks/companyProfile.mock";

const mockNext = jest.fn();

describe("checkCompany", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const VALID_REQ: httpMocks.RequestOptions = {
        method: "GET",
        url: PrefixedUrls.INDIVIDUAL_PSC_LIST,
        query: {
            lang: "en",
            companyNumber: COMPANY_NUMBER
        }
    };

    describe("should redirect to Company Status Stop Screen", () => {
        it("when the company is dissolved", async () => {
            const req = httpMocks.createRequest(VALID_REQ);
            const dissolvedCompany = { ...validCompanyProfile };
            dissolvedCompany.companyStatus = "dissolved";
            const res = httpMocks.createResponse({
                locals: {
                    companyProfile: dissolvedCompany
                }
            });

            checkCompany(req, res, mockNext);
            expect(res.locals?.companyProfile).toBe(dissolvedCompany);
            expect(res.statusCode).toBe(HttpStatusCode.Found);
            expect(res._getRedirectUrl()).toBe("/persons-with-significant-control-verification/stop/company-status?companyNumber=12345678&lang=en");
        });
    });

    describe("should redirect to Company Type Stop Screen", () => {
        it("when the company is not in the allowed list", async () => {
            const req = httpMocks.createRequest(VALID_REQ);
            const unknownTypeCompany = { ...validCompanyProfile };
            unknownTypeCompany.type = "unknownType";
            const res = httpMocks.createResponse({
                locals: {
                    companyProfile: unknownTypeCompany
                }
            });

            checkCompany(req, res, mockNext);
            expect(res.locals?.companyProfile).toBe(unknownTypeCompany);
            expect(res.statusCode).toBe(HttpStatusCode.Found);
            expect(res._getRedirectUrl()).toBe("/persons-with-significant-control-verification/stop/company-type?companyNumber=12345678&lang=en");
        });
    });

    describe("should call next", () => {
        it("when the company is in a valid state", () => {
            const req = httpMocks.createRequest(VALID_REQ);
            const res = httpMocks.createResponse({
                locals: {
                    companyProfile: validCompanyProfile
                }
            });

            checkCompany(req, res, mockNext);
            expect(mockNext).toHaveBeenCalled();
            expect(res.statusCode).toBe(HttpStatusCode.Ok);
        });
    });

});
