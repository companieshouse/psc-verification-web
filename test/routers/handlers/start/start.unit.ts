import * as httpMocks from "node-mocks-http";
import { StartHandler } from "../../../../src/routers/handlers/start/startHandler";
import { Urls } from "../../../../src/constants";

describe("start handler", () => {
    describe("executeGet", () => {

        it("should return the correct template path", async () => {
            const req = httpMocks.createRequest({
                method: "GET",
                url: Urls.START
            });

            const res = httpMocks.createResponse({});
            const handler = new StartHandler();

            const { templatePath, viewData } = await handler.executeGet(req, res);

            expect(templatePath).toBe("router_views/start/start");
        });
        it("should return the correct view data", async () => {
            const req = httpMocks.createRequest({
                method: "GET",
                url: Urls.START
            });

            const res = httpMocks.createResponse({});
            const handler = new StartHandler();

            const { templatePath, viewData } = await handler.executeGet(req, res);

            expect.objectContaining({
                title: "PSC Verification",
                currentUrl: "/persons-with-significant-control-verification/start?lang=en",
                idvImplementationDate: "1 September 2025"
            });

        });
    });
});
