import { CompanyPersonsWithSignificantControlResource } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Session } from "@companieshouse/node-session-handler";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import { createOAuthApiClient } from "../../src/services/apiClientService";
import { getCompanyPscList } from "../../src/services/companyPscService";
import { COMPANY_NUMBER, VALID_COMPANY_PSC_LIST } from "../mocks/companyPsc.mock";

jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/services/apiClientService");
let session: Session;
const mockGetCompanyPsc = jest.fn();
const mockCreateOAuthApiClient = createOAuthApiClient as jest.Mock;

mockCreateOAuthApiClient.mockReturnValue({
    companyPsc: {
        getCompanyPsc: mockGetCompanyPsc
    }
});

describe("companyPscService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        session = new Session();
    });

    it("getCompanyPscList should return 200 OK HttpStatus response", async () => {
        const mockResponse: ApiResponse<CompanyPersonsWithSignificantControlResource> = {
            httpStatusCode: HttpStatusCode.Ok,
            resource: VALID_COMPANY_PSC_LIST
        };
        mockGetCompanyPsc.mockResolvedValueOnce(mockResponse as ApiResponse<CompanyPersonsWithSignificantControlResource>);
        const request = {} as Request;
        request.query = { companyNumber: COMPANY_NUMBER };

        const response = await getCompanyPscList(request);
        expect(response.httpStatusCode).toBe(HttpStatusCode.Ok);

        const resource = response.resource as CompanyPersonsWithSignificantControlResource;
        expect(resource).toEqual(VALID_COMPANY_PSC_LIST);

        expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
        expect(mockGetCompanyPsc).toHaveBeenCalledTimes(1);
        expect(mockGetCompanyPsc).toHaveBeenCalledWith(COMPANY_NUMBER);

    });
});
