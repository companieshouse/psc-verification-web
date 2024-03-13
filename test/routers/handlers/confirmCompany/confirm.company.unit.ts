import app from "../../../../src/app";
import request from "supertest";
import { PrefixedUrls } from "../../../../src/constants";

describe("confirm company tests", () => {

    const diffCompanyHtml = "href=/persons-with-significant-control-verification/company-number";

    it("Should render the Confirm Company page with a successful status code", async () => {
        const resp = await request(app).get(PrefixedUrls.CONFIRM_COMPANY);
        expect(resp.status).toBe(200);
    });

    it("Should display 'Confirm this is the correct company' message on the Confirm Company page", async () => {
        const resp = await request(app).get(PrefixedUrls.CONFIRM_COMPANY);
        expect(resp.text).toContain("Confirm this is the correct company");
    });

    it("Should include a 'Confirm and continue' button on the Confirm Company page", async () => {
        const resp = await request(app).get(PrefixedUrls.CONFIRM_COMPANY);
        expect(resp.text).toContain("Confirm and continue");
    });

    it("Should include a 'Choose a different company' button link on the Confirm Company page", async () => {
        const resp = await request(app).get(PrefixedUrls.CONFIRM_COMPANY);
        expect(resp.text).toContain(diffCompanyHtml);
    });
});
