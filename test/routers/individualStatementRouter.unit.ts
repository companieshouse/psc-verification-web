import { HttpStatusCode } from "axios";
import request from "supertest";
import { PrefixedUrls } from "../../src/constants";
import { getPscVerification } from "../../src/services/pscVerificationService";
import { CREATED_RESOURCE } from "../mocks/pscVerification.mock";
import middlewareMocks from "./../mocks/allMiddleware.mock";
import app from "./../../src/app";
import { PSC_INDIVIDUAL } from "../mocks/psc.mock";

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

describe("individual statement tests", () => {

    beforeEach(() => {
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
    });

    it("Should render the individual statement page with a successful status code", async () => {
        const resp = await request(app).get(PrefixedUrls.INDIVIDUAL_STATEMENT);
        expect(resp.status).toBe(200);
    });
});
