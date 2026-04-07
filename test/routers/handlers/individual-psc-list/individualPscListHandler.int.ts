import { HttpStatusCode } from "axios";
import * as cheerio from "cheerio";
import request from "supertest";
import { URLSearchParams } from "url";
import mockSessionMiddleware from "../../../mocks/sessionMiddleware.mock";
import mockServiceUnavailableMiddleware from "../../../mocks/serviceUnavailable.mock";
import mockAuthenticationMiddleware from "../../../mocks/authenticationMiddleware.mock";
import app from "../../../../src/app";
import { PrefixedUrls } from "../../../../src/constants";
import { COMPANY_NUMBER, INDIVIDUAL_PSCS_LIST } from "../../../mocks/companyPsc.mock";
import { getCompanyProfile } from "../../../../src/services/companyProfileService";
import { validCompanyProfile } from "../../../mocks/companyProfile.mock";
import { getCompanyIndividualPscList } from "../../../../src/services/companyPscService";
import * as config from "../../../../src/config";
import { getPscVerificationByNotificationId } from "../../../../src/services/pscVerificationService";
import { IndividualPscListHandler } from "../../../../src/routers/handlers/individual-psc-list/individualPscListHandler";
import { getTransactionData } from "../../../../src/services/transactionService";
import { Request } from "express";

jest.mock("../../../../src/services/companyProfileService");
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);

jest.mock("../../../../src/services/companyPscService");
const mockGetCompanyIndividualPscList = getCompanyIndividualPscList as jest.Mock;
mockGetCompanyIndividualPscList.mockResolvedValue(INDIVIDUAL_PSCS_LIST);
jest.mock("../../../../src/services/pscService");

jest.mock("../../../../src/services/pscVerificationService");
const mockGetPscVerificationByNotificationId = getPscVerificationByNotificationId as jest.Mock;

jest.mock("../../../../src/services/transactionService");
const mockGetTransactionData = getTransactionData as jest.Mock;

jest.mock("../../../../src/config", () => ({
    env: { ...process.env }
}));
const mockConfig = config as { env: {
    EXTENSIONS_LIVE: boolean
} };

describe("individual PSC list view", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        expect(mockSessionMiddleware).toHaveBeenCalledTimes(1);
        expect(mockServiceUnavailableMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
        expect(mockGetCompanyProfile).toHaveBeenCalledTimes(1);
        expect(mockGetCompanyIndividualPscList).toHaveBeenCalledTimes(1);
        expect(mockGetPscVerificationByNotificationId).toHaveBeenCalledTimes(2);
    });

    it("Should render the Individual PSC List page with a success status code and correct links", async () => {
        const queryParams = new URLSearchParams(`companyNumber=${COMPANY_NUMBER}&lang=en`);
        const uriWithQuery = `${PrefixedUrls.INDIVIDUAL_PSC_LIST}?${queryParams}`;

        const resp = await request(app).get(uriWithQuery);
        const $ = cheerio.load(resp.text);

        expect(resp.status).toBe(HttpStatusCode.Ok);
        // check page contents
        expect($("a.govuk-back-link").attr("href")).toBe(`/persons-with-significant-control-verification/confirm-company?companyNumber=${COMPANY_NUMBER}&lang=en`);
        // summary cards for individual PSCs
        expect($("h1").text()).toBe("PSC identity verification status");
        expect($("h2.govuk-summary-card__title").eq(0).text()).toContain(`Mr Jim Testerly`);
        expect($("h2.govuk-summary-card__title").eq(1).text()).toContain(`Mr Test Tester Testington`);
    });

    it("Should render verify and request extension links for each PSC in canVerifyNowDetails", async () => {
        const queryParams = new URLSearchParams(`companyNumber=${COMPANY_NUMBER}&lang=en`);
        const uriWithQuery = `${PrefixedUrls.INDIVIDUAL_PSC_LIST}?${queryParams}`;

        const resp = await request(app).get(uriWithQuery);
        const $ = cheerio.load(resp.text);

        const summaryCards = $(".govuk-summary-card");
        expect(summaryCards.length).toBeGreaterThan(0);

        // For each summary card, check for verify and request extension links
        summaryCards.each((_, card) => {
            const verifyLink = $(card).find("a:contains('Provide verification details')");
            const extensionLink = $(card).find("a:contains('Request extension')");

            // Verify link should exist and have correct href
            expect(verifyLink.length).toBe(1);
            expect(verifyLink.attr("href")).toMatch(/\/persons-with-significant-control-verification\/new-submission\?companyNumber=.*&lang=.*&selectedPscId=.*/);
            expect(verifyLink.attr("href")).toContain(`companyNumber=${COMPANY_NUMBER}`);

            // Extension link should exist and have correct href
            expect(extensionLink.length).toBe(1);
            expect(extensionLink.attr("href")).toMatch(/\/persons-with-significant-control-extensions\/requesting-an-extension\?companyNumber=.*&selectedPscId=.*&lang=.*/);
            expect(extensionLink.attr("href")).toContain(`companyNumber=${COMPANY_NUMBER}`);
        });
    });

    it("Should not render request extension link when EXTENSIONS_LIVE is false", async () => {
        mockConfig.env.EXTENSIONS_LIVE = false;

        const queryParams = new URLSearchParams(`companyNumber=${COMPANY_NUMBER}&lang=en`);
        const uriWithQuery = `${PrefixedUrls.INDIVIDUAL_PSC_LIST}?${queryParams}`;

        const resp = await request(app).get(uriWithQuery);
        const $ = cheerio.load(resp.text);

        const summaryCards = $(".govuk-summary-card");
        expect(summaryCards.length).toBeGreaterThan(0);

        // For each summary card, check Verify and Request extension links
        summaryCards.each((_, card) => {
            const verifyLink = $(card).find("a:contains('Provide verification details')");
            const extensionLink = $(card).find("a:contains('Request extension')");

            // Verify link should exist
            expect(verifyLink.length).toBe(1);

            // Extension link should not exist
            expect(extensionLink.length).toBe(0);
        });
    });

});

describe("IndividualPscListHandler.checkPendingTransactions", () => {
    let handler: IndividualPscListHandler;
    let req: Partial<Request>;

    beforeEach(() => {
        handler = new IndividualPscListHandler();
        req = {};
        jest.clearAllMocks();
    });

    it("should set isPendingVerification true if any filing is processing", async () => {
        const psc: any = { links: { self: "/company/123/psc/PSC1" } };
        (mockGetPscVerificationByNotificationId).mockResolvedValue({
            resource: { links: { self: "/transactions/tx123/filings/filing1" } }
        });
        (mockGetTransactionData).mockResolvedValue({
            filings: { filing1: { status: "processing" }, filing2: { status: "submitted" } }
        });
        await handler["checkPendingTransactions"]([psc], req as Request);
        expect(psc.isPendingVerification).toBe(true);
        expect(mockGetPscVerificationByNotificationId).toHaveBeenCalledWith(req, "PSC1");
    });

    it("should set isPendingVerification false if no filing is processing", async () => {
        const psc: any = { links: { self: "/company/123/psc/PSC2" } };
        (mockGetPscVerificationByNotificationId).mockResolvedValue({
            resource: { links: { self: "/transactions/tx124/filings/filing1" } }
        });
        (mockGetTransactionData).mockResolvedValue({
            filings: { filing1: { status: "submitted" }, filing2: { status: "accepted" } }
        });
        await handler["checkPendingTransactions"]([psc], req as Request);
        expect(psc.isPendingVerification).toBe(false);
        expect(mockGetPscVerificationByNotificationId).toHaveBeenCalledWith(req, "PSC2");
    });

    it("should not set isPendingVerification if no verification resource", async () => {
        const psc: any = { links: { self: "/company/123/psc/PSC3" } };
        (mockGetPscVerificationByNotificationId).mockResolvedValue(null);
        await handler["checkPendingTransactions"]([psc], req as Request);
        expect(psc.isPendingVerification === undefined || psc.isPendingVerification === false).toBe(true);
        expect(mockGetPscVerificationByNotificationId).toHaveBeenCalledWith(req, "PSC3");
    });

    it("should not set isPendingVerification if no transaction data", async () => {
        const psc: any = { links: { self: "/company/123/psc/PSC4" } };
        (mockGetPscVerificationByNotificationId).mockResolvedValue({
            resource: { links: { self: "/transactions/tx125/filings/filing1" } }
        });
        (mockGetTransactionData).mockResolvedValue(undefined);
        await handler["checkPendingTransactions"]([psc], req as Request);
        expect(psc.isPendingVerification === undefined || psc.isPendingVerification === false).toBe(true);
        expect(mockGetPscVerificationByNotificationId).toHaveBeenCalledWith(req, "PSC4");
    });

    it("should set isPendingVerification false if an error is thrown when checking transaction status", async () => {
        const psc: any = { links: { self: "/company/123/psc/PSC5" } };
        (mockGetPscVerificationByNotificationId).mockImplementation(() => { throw new Error("API error"); });
        await handler["checkPendingTransactions"]([psc], req as Request);
        expect(psc.isPendingVerification).toBe(false);
        expect(mockGetPscVerificationByNotificationId).toHaveBeenCalledWith(req, "PSC5");
    });
});
