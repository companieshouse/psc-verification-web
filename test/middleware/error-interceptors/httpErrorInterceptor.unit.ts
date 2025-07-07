import { httpErrorInterceptor } from "../../../src/middleware/error-interceptors/httpErrorInterceptor";
import { HttpError } from "../../../src/lib/errors/httpError";
import { HttpStatusCode } from "axios";
import httpMocks from "node-mocks-http";
import { njk } from "../../../src/app";
import { getViewData } from "../../../src/routers/handlers/generic";

jest.mock("../../../src/app", () => ({
    njk: {
        getTemplate: jest.fn()
    }
}));
jest.mock("../../../src/routers/handlers/generic", () => ({
    getViewData: jest.fn()
}));

const mockGetTemplate = njk.getTemplate as jest.Mock;
const mockGetViewData = getViewData as jest.Mock;

describe("httpErrorInterceptor", () => {
    const mockRender = jest.fn();
    const req = httpMocks.createRequest({
        url: "/test-url",
        query: { lang: "en" }
    });
    const res = httpMocks.createResponse();
    res.render = mockRender;

    const next = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetViewData.mockResolvedValue({}); // Ensure getViewData resolves
    });

    it("should handle HttpError and render the correct template", async () => {
        const error = new HttpError("Not Found", HttpStatusCode.NotFound);

        httpErrorInterceptor(error, req, res, next);
        await new Promise(process.nextTick);

        expect(res.statusCode).toBe(HttpStatusCode.NotFound);
        expect(mockRender).toHaveBeenCalledWith("error/404-not-found", expect.any(Object));
    });

    it("should handle generic Error and render the fallback template", async () => {
        const error = new Error("Unhandled error");

        httpErrorInterceptor(error, req, res, next);
        await new Promise(process.nextTick);

        expect(res.statusCode).toBe(HttpStatusCode.InternalServerError);
        expect(mockRender).toHaveBeenCalledWith("error/500-internal-server-error", expect.any(Object));
    });

    it("should fall back to the default template if the specific template is missing", async () => {
        const error = new HttpError("Not Found", HttpStatusCode.NotFound);

        mockGetTemplate.mockImplementationOnce(() => {
            throw new Error("Template not found");
        });

        httpErrorInterceptor(error, req, res, next);
        await new Promise(process.nextTick);

        expect(res.statusCode).toBe(HttpStatusCode.NotFound);
        expect(mockGetTemplate).toHaveBeenCalledWith("error/404-not-found.njk");
        expect(mockRender).toHaveBeenCalledWith("error/500-internal-server-error", expect.any(Object));
    });
});

describe("mapStatusCodeToTemplate", () => {
    const { mapStatusCodeToTemplate } = jest.requireActual(
        "../../../src/middleware/error-interceptors/httpErrorInterceptor"
    );

    it("should convert status code to the correct template name", () => {
        expect(mapStatusCodeToTemplate(HttpStatusCode.NotFound)).toBe("404-not-found");
        expect(mapStatusCodeToTemplate(HttpStatusCode.InternalServerError)).toBe("500-internal-server-error");
        expect(mapStatusCodeToTemplate(HttpStatusCode.ImATeapot)).toBe("418-im-a-teapot");
        expect(mapStatusCodeToTemplate(HttpStatusCode.HttpVersionNotSupported)).toBe("505-http-version-not-supported");
    });

    it("should fall back to the default template name for invalid status codes", () => {
        expect(mapStatusCodeToTemplate(999)).toBe("500-internal-server-error");
        expect(mapStatusCodeToTemplate(-1)).toBe("500-internal-server-error");
    });
});
