import { HttpStatusCode } from "axios";
import request from "supertest";
import { PrefixedUrls } from "../../src/constants";
import { INDIVIDUAL_VERIFICATION_CREATED } from "../mocks/pscVerification.mock";
import middlewareMocks from "./../mocks/allMiddleware.mock";
import app from "./../../src/app";
import { PSC_INDIVIDUAL } from "../mocks/psc.mock";

jest.mock("../../src/services/pscVerificationService", () => ({
    getPscVerification: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: INDIVIDUAL_VERIFICATION_CREATED
    })
}));
jest.mock("../../src/services/pscService", () => ({
    getPscIndividual: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: PSC_INDIVIDUAL
    })
}));

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
