import * as cheerio from "cheerio";
import mockSessionMiddleware from "../mocks/sessionMiddleware.mock";
import mockFetchCompanyMiddleware from "../mocks/fetchCompany.mock";
import mockFetchVerificationMiddleware from "../mocks/fetchVerification.mock";
import request from "supertest";
import app from "../../src/app";
import { PrefixedUrls, servicePathPrefix } from "../../src/constants";
import { HttpStatusCode } from "axios";
import { checkPlannedMaintenance } from "../../src/services/pscVerificationService";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { PlannedMaintenance } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { PLANNED_MAINTENANCE, SECOND_DATE } from "../mocks/pscVerification.mock";

jest.mock("../../src/services/pscVerificationService");
const mockCheckPlannedMaintenance = checkPlannedMaintenance as jest.Mock;

const plannedMaintenanceResponseUp: ApiResponse<PlannedMaintenance> = {
    httpStatusCode: 0,
    resource: PLANNED_MAINTENANCE
};
mockCheckPlannedMaintenance.mockResolvedValue(PLANNED_MAINTENANCE);

describe("Start router/handler integration tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        expect(mockSessionMiddleware).toHaveBeenCalledTimes(1);
        expect(mockFetchCompanyMiddleware).not.toHaveBeenCalled();
        expect(mockFetchVerificationMiddleware).not.toHaveBeenCalled();
    });

    const START_HEADING = "Provide identity verification details for a person with significant control";

    describe("Cookie banner", () => {

        describe("GET method when cookie settings are to be confirmed", () => {
            it("should render the start page with the cookies banner", async () => {
                const resp = await request(app).get(servicePathPrefix);

                expect(resp.status).toBe(HttpStatusCode.Ok);
                const $ = cheerio.load(resp.text);
                expect($("p.govuk-body:first").text()).toContain("We use some essential cookies to make our services work");
                expect($("h1.govuk-heading-l").text()).toMatch(START_HEADING);

            });

        });

    });

    describe("Planned maintenance", () => {

        const SERVICE_UNAVAILABLE_HEADING = "Sorry, the service is unavailable";

        describe("GET method when no Planned Maintenance set", () => {
            it("should render the start page for service root URL", async () => {
                const resp = await request(app).get(servicePathPrefix);

                expect(resp.status).toBe(HttpStatusCode.Ok);
                const $ = cheerio.load(resp.text);
                expect($("h1.govuk-heading-l").text()).toMatch(START_HEADING);
            });

            it("should render the start page for /start URL", async () => {
                const resp = await request(app).get(PrefixedUrls.START);

                expect(resp.status).toBe(HttpStatusCode.Ok);
                const $ = cheerio.load(resp.text);
                expect($("h1.govuk-heading-l").text()).toMatch(START_HEADING);
            });
        });

        describe("GET method when Planned Maintenance IS set", () => {
            it("should render the service unavailable page for service root URL, and the time as expected", async () => {
                const plannedMaintenanceOutOfService = { ...plannedMaintenanceResponseUp };
                plannedMaintenanceOutOfService.resource!.status = "OUT_OF_SERVICE";
                mockCheckPlannedMaintenance.mockResolvedValue(plannedMaintenanceOutOfService);
                const resp = await request(app).get(servicePathPrefix);

                expect(resp.status).toBe(HttpStatusCode.ServiceUnavailable);
                const $ = cheerio.load(resp.text);
                expect($("h1.govuk-heading-l").text()).toMatch(SERVICE_UNAVAILABLE_HEADING);
                expect($("p.govuk-body").text()).toContain("3:04am on Tuesday 2 January 2024");
            });

            it("should render the service unavailable page for service root URL, and the time as expected", async () => {
                const amendedPlannedMaintenanceOutOfService = {
                    ...plannedMaintenanceResponseUp,
                    resource: {
                        ...plannedMaintenanceResponseUp.resource,
                        maintenance_end_time: SECOND_DATE
                    }
                };
                mockCheckPlannedMaintenance.mockResolvedValue(amendedPlannedMaintenanceOutOfService);
                const resp = await request(app).get(servicePathPrefix);

                expect(resp.status).toBe(HttpStatusCode.ServiceUnavailable);
                const $ = cheerio.load(resp.text);
                expect($("h1.govuk-heading-l").text()).toMatch(SERVICE_UNAVAILABLE_HEADING);
                expect($("p.govuk-body").text()).toContain("3am on Tuesday 2 January 2024");
            });

            it("should render the service unavailable page for '/start' URL", async () => {
                const resp = await request(app).get(PrefixedUrls.START);

                expect(resp.status).toBe(HttpStatusCode.ServiceUnavailable);
                const $ = cheerio.load(resp.text);
                expect($("h1.govuk-heading-l").text()).toMatch(SERVICE_UNAVAILABLE_HEADING);
            });
        });
    });

    describe("Page footer", () => {
        beforeEach(() => {
            mockCheckPlannedMaintenance.mockResolvedValue({
                httpStatusCode: 200,
                resource: { ...PLANNED_MAINTENANCE, status: "UP" }
            });
        });

        it("should render the footer with the expected links", async () => {
            const resp = await request(app).get(servicePathPrefix);
            expect(resp.status).toBe(HttpStatusCode.Ok);
            const $ = cheerio.load(resp.text);

            const expectedLinks = [
                { href: "https://resources.companieshouse.gov.uk/serviceInformation.shtml", text: "Policies" },
                { href: "help/cookies", text: "Cookies" },
                { href: "https://www.gov.uk/government/organisations/companies-house#org-contacts", text: "Contact us" },
                { href: "accessibility-statement", text: "Accessibility" }
            ];

            const footerLinks = $(".govuk-footer__inline-list-item a");
            expect(footerLinks.length).toBe(expectedLinks.length);

            expectedLinks.forEach((link, i) => {
                expect(footerLinks.eq(i).attr("href")).toBe(link.href);
                expect(footerLinks.eq(i).text().trim()).toBe(link.text);
            });

        });

        it("should render the Open Government Licence link correctly", async () => {

            const resp = await request(app).get(servicePathPrefix);
            expect(resp.status).toBe(HttpStatusCode.Ok);
            const $ = cheerio.load(resp.text);

            const licenceText = $(".govuk-footer__licence-description p");
            expect(licenceText.length).toBe(1);
            const normalisedLicenceText = licenceText.text().replace(/\s+/g, " ").replace(/\s+,/g, ",").trim();
            expect(normalisedLicenceText).toBe("All content is available under the Open Government Licence v3.0, except where otherwise stated");
            const oglLink = $(".govuk-footer__licence-description a");
            expect(oglLink.length).toBe(1);
            expect(oglLink.attr("href")).toBe("https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/");
        });

        it("should render the Crown copyright link correctly", async () => {
            const resp = await request(app).get(servicePathPrefix);
            expect(resp.status).toBe(HttpStatusCode.Ok);
            const $ = cheerio.load(resp.text);

            const copyrightLink = $("a.govuk-footer__copyright-logo");
            expect(copyrightLink.length).toBe(1);
            expect(copyrightLink.text().trim()).toBe("© Crown copyright");
            expect(copyrightLink.attr("href")).toBe("https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/");
        });
    });

});
