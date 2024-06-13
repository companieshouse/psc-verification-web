import { formatDateBorn, internationaliseDate } from "../../../src/routers/utils";

describe("formatDateBorn tests", () => {

    it("should return January when the month is 1 (January)", () => {
        const dateOfBirth = { month: 1, year: 1995 };
        const lang = "en";
        const result = formatDateBorn(dateOfBirth, lang);
        expect(result).toBe("January 1995");
    });

    it("should return 'Invalid date' when dateOfBirth is invalid", () => {
        const dateOfBirth = { month: 13, year: 1995 };
        const lang = "en";
        const result = formatDateBorn(dateOfBirth, lang);
        expect(result).toBe("Invalid date");
    });

    it("should return December when the month is 12 (December)", () => {
        const dateOfBirth = { month: 12, year: 1995 };
        const lang = "en";
        const result = formatDateBorn(dateOfBirth, lang);
        expect(result).toBe("December 1995");
    });

    it("should return Mehefin 2024 when the month is 6 and lang is cy", () => {
        const dateOfBirth = { month: 6, year: 1995 };
        const lang = "cy";
        const result = formatDateBorn(dateOfBirth, lang);
        expect(result).toBe("Mehefin 1995");
    });
});

describe("internationaliseDate tests", () => {
    it("formats date in en-GB when lang is en", () => {
        const date = "2024-06-06";
        const lang = "en";
        const formattedDate = internationaliseDate(date, lang);
        expect(formattedDate).toBe("6 June 2024");
    });

    it("formats date in Welsh when lang is cy", () => {
        const date = "1995-06-06";
        const lang = "cy";
        const formattedDate = internationaliseDate(date, lang);
        expect(formattedDate).toBe("6 Mehefin 1995");
    });

    it("should return Invalid date when date is invalid", () => {
        const date = "Invalid date";
        const lang = "en";
        const formattedDate = internationaliseDate(date, lang);
        expect(formattedDate).toBe("Invalid date");
    });
});
