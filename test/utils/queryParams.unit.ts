import { Urls } from "../../src/constants";
import { addSearchParams } from "../../src/utils/queryParams";

describe("behaviour when adding search params to URI", () => {
    it("should leave the URI unchanged when params are empty", () => {
        const result = addSearchParams(Urls.START, {});

        expect(result).toEqual(Urls.START);
    });

    it("should use '?' separator for first param then '&' for the rest", () => {
        const result = addSearchParams(Urls.START, { colour: "green", flavour: "sour" });

        expect(result).toEqual(`${Urls.START}?colour=green&flavour=sour`);
    });

    it("should add values to any existing URI params", () => {
        const uri = `${Urls.START}?flavour=sweet`;
        const result = addSearchParams(uri, { colour: "green", flavour: "sour" });

        expect(result).toEqual(`${Urls.START}?flavour=sweet&colour=green&flavour=sour`);
    });

    it("should apply array params as multiple entries", () => {
        const result = addSearchParams(Urls.START, { colour: "green", flavours: ["sweet", "sour"] });

        expect(result).toEqual(`${Urls.START}?colour=green&flavours=sweet&flavours=sour`);
    });
});
