import { toHourDayDateFormat, toReadableFormat } from "../../src/utils/date";

describe("Utils date functions", () => {
    describe("toReadableFormat should display:", () => {
        const date = [
            ["10 Nov 23 12:04 GMT", "10 November 2023", "en"],
            ["10 Nov 23 12:04 GMT", "10 November 2023", undefined],
            ["10 Nov 23 12:04 GMT", "10 Tachwedd 2023", "cy"],
            [undefined, "", "en"]
        ];
        it.each(date)("'%s' as '%s'", (dateIn, dateOut, lang) => {
            const result = toReadableFormat(dateIn, lang);
            expect(result).toBe(dateOut);
        });

        it("should throw for an invalid date", () => {
            expect(() => { toReadableFormat("invalid", "en"); }).toThrow(undefined);
        });
    });

    describe("toHourDayDateFormat should display:", () => {
        const dateTime = [
            ["10 Nov 23 12:04 GMT", "12:04pm on Friday 10 November 2023", "en"],
            ["10 Nov 23 12:04 GMT", "12:04pm on Friday 10 November 2023", undefined],
            ["10 Nov 23 12:00 GMT", "12pm on Friday 10 November 2023", "en"],
            ["10 Nov 23 12:04 GMT", "12:04yh am Dydd Gwener 10 Tachwedd 2023", "cy"],
            ["10 Nov 23 12:00 GMT", "12yh am Dydd Gwener 10 Tachwedd 2023", "cy"],
            [undefined, "", "en"]
        ];
        it.each(dateTime)("'%s' as '%s'", (dateIn, dateOut, lang) => {
            const result = toHourDayDateFormat(dateIn, lang);
            expect(result).toBe(dateOut);
        });

        it("should throw for an invalid date", () => {
            expect(() => { toHourDayDateFormat("invalid", "en"); }).toThrow(undefined);
        });
    });
});
