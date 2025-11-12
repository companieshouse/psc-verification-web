import * as httpMocks from "node-mocks-http";
import AccessibilityStatementHandler from "../../../../src/routers/handlers/accessibility-statement/accessibilityStatementHandler";
import { Urls } from "../../../../src/constants";

describe("AccessibilityStatementHandler", () => {
    describe("executeGet", () => {
        it("should return the correct template path and view data", async () => {
            const req = httpMocks.createRequest({
                method: "GET",
                url: Urls.ACCESSIBILITY_STATEMENT,
                query: { lang: "en" }
            });
            const res = httpMocks.createResponse({});
            const handler = new AccessibilityStatementHandler();
            const { templatePath, viewData } = await handler.executeGet(req, res);
            expect(templatePath).toBe("router_views/accessibilityStatement/accessibility-statement");
            // expect(viewData.currentUrl).toBe("/persons-with-significant-control-verification/accessibility-statement?lang=en");
            // expect(viewData.isSignedIn).toBe(false);
            expect(viewData.templateName).toBe(Urls.ACCESSIBILITY_STATEMENT);
        });
    });
});
