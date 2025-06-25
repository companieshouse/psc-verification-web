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

        it("instead throw for an invalid date", () => {
            expect(() => { toReadableFormat("invalid", "en"); }).toThrow(undefined);
        });
    });

    describe("toHourDayDateFormat should display:", () => {
        const dateTime = [
            ["10 Nov 23 12:04 GMT", "12:04pm on Friday 10 November 2023", "en"],
            ["10 Nov 23 12:00 GMT", "12pm on Friday 10 November 2023", "en"],
            ["10 Nov 23 00:00 GMT", "12am on Friday 10 November 2023", "en"],
            ["10 Nov 23 12:04 GMT", "12:04pm on Friday 10 November 2023", undefined],
            ["10 Nov 23 12:04 GMT", "12:04yh am Dydd Gwener 10 Tachwedd 2023", "cy"],
            ["10 Nov 23 12:00 GMT", "12yh am Dydd Gwener 10 Tachwedd 2023", "cy"],
            [undefined, "", "en"],
            ["2025-11-15T07:00:00Z", "7am on Saturday 15 November 2025", "en"], // Maintenance ISO (UTC) correct DST conversion
            ["2025-06-15T07:00:00Z", "8am on Sunday 15 June 2025", "en"] // Maintenance ISO (UTC) correct DST conversion
        ];
        it.each(dateTime)("'%s' as '%s'", (dateIn, dateOut, lang) => {
            const result = toHourDayDateFormat(dateIn, lang);
            expect(result).toBe(dateOut);
        });

        it("instead throw for an invalid date", () => {
            expect(() => { toHourDayDateFormat("invalid", "en"); }).toThrow(undefined);
        });
    });
});
