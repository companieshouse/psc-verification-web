import { toHourDayDateFormat, toReadableFormat } from "../../src/utils/date";

describe("toReadableFormat function", () => {
    it("should convert date for display", () => {
        const result = toReadableFormat("10 Nov 23 12:04 GMT", "en");
        expect(result).toBe("10 November 2023");
    });

    it("should convert date for welsh display", () => {
        const result = toReadableFormat("10 Nov 23 12:04 GMT", "cy");
        expect(result).toEqual("10 Tachwedd 2023");
    });

    it("should throw for an invalid date", () => {
        expect(() => { toReadableFormat("invalid", "en"); }).toThrow(undefined);
    });

    it("should return empty string", () => {
        const result = toReadableFormat(undefined);
        expect(result).toEqual("");
    });
});

describe("toHourDayDateFormat function", () => {
    it("should convert date for display", () => {
        const result = toHourDayDateFormat("10 Nov 23 12:04 GMT", "en");
        expect(result).toBe("12:04PM on Friday 10 November 2023");
    });

    it("should convert date for welsh display", () => {
        const result = toHourDayDateFormat("10 Nov 23 12:04 GMT", "cy");
        expect(result).toEqual("12:04yh am Dydd Gwener 10 Tachwedd 2023");
    });

    it("should throw for an invalid date", () => {
        expect(() => { toHourDayDateFormat("invalid", "en"); }).toThrow(undefined);
    });

    it("should return empty string", () => {
        const result = toHourDayDateFormat(undefined);
        expect(result).toEqual("");
    });
});
