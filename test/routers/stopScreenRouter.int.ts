import { HttpStatusCode } from "axios";
import request from "supertest";
import { STOP_TYPE, toStopScreenPrefixedUrl } from "../../src/constants";
import middlewareMocks from "../mocks/allMiddleware.mock";
import app from "../../src/app";
import { getUrlWithStopType } from "../../src/utils/url";
import { getTransaction } from "../../src/services/transactionService";
import { OPEN_PSC_TRANSACTION } from "../mocks/transaction.mock";

jest.mock("../../src/services/transactionService");
const mockGetTransaction = getTransaction as jest.Mock;
mockGetTransaction.mockResolvedValue(OPEN_PSC_TRANSACTION);

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

    it.each(Object.values(STOP_TYPE))("Should render the stop screen '%s' with a successful status code", async (stopType: STOP_TYPE) => {
        const stopScreenUrl = getUrlWithStopType(toStopScreenPrefixedUrl(stopType), stopType);
        const resp = await request(app).get(getUrlWithStopType(stopScreenUrl, stopType));

        expect(resp.status).toBe(HttpStatusCode.Ok);
    });

});
