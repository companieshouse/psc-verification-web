import middlewareMocks from "./../mocks/allMiddleware.mock";
import { HttpStatusCode } from "axios";
import request from "supertest";
import app from "../../src/app";
import { PrefixedUrls } from "../../src/constants";
import { CREATED_RESOURCE } from "../mocks/pscVerification.mock";
import { PSC_INDIVIDUAL } from "../mocks/Psc.mock";
import { getPscVerification } from "../../src/services/pscVerificationService";

jest.mock("../../src/services/pscVerificationService", () => ({
    getPscVerification: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: CREATED_RESOURCE
    })
}));

jest.mock("../../src/services/pscService", () => ({
    getPscIndividual: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: PSC_INDIVIDUAL
    })
}));
const mockGetPscVerification = getPscVerification as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();
});

describe("personal code router tests", () => {

    beforeEach(() => {
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
    });

    it("Should render the personal code page with a successful status code", async () => {
        const resp = await request(app).get(PrefixedUrls.PERSONAL_CODE);
        expect(resp.status).toBe(HttpStatusCode.Ok);
    });

    // it("Should redirect to the verification statement page", async () => {
    //     const resp = await request(app).get(PrefixedUrls.INDIVIDUAL_STATEMENT);
    //     expect(resp.text).toContain("Redirecting to /individual/psc-statement");
    // });
});
