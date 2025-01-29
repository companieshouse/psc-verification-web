import { getPscValidationMessages } from "../../src/config/api.enumerations";
import { getDobValidationMessage, getNameValidationMessages, getUvidValidationMessages } from "../../src/middleware/checkValidationMessages";

jest.mock("../../src/config/api.enumerations", () => ({
    getPscValidationMessages: jest.fn()
}));

describe("getNameValidationMessages", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockGetPscValidationMessages = getPscValidationMessages as jest.Mock;

    // Set up the mock to return specific values for each key
    mockGetPscValidationMessages.mockImplementation((key: string) => {
        const mockPscVerification: { [key: string]: string[] } = {
            "forenames-mismatch": ["Forenames do not match"],
            "surname-mismatch": ["Surname does not match"],
            "no-name-mismatch-reason": ["No name mismatch reason provided"],
            "dob-mismatch": ["The details linked to this personal code do not match the details on our records"],
            "unknown-uvid": ["UVID is not recognised"],
            "expired-uvid": ["UVID has expired"],
            "invalid-record": ["UVID is invalid"]
        };
        return mockPscVerification[key] || [key];
    });

    it("Should return the correct name validation messages", () => {
        const result = getNameValidationMessages();
        expect(result).toEqual([
            "Forenames do not match",
            "Surname does not match",
            "No name mismatch reason provided"
        ]);
        expect(mockGetPscValidationMessages).toHaveBeenCalledTimes(3);
        expect(mockGetPscValidationMessages).toHaveBeenCalledWith("forenames-mismatch");
        expect(mockGetPscValidationMessages).toHaveBeenCalledWith("surname-mismatch");
        expect(mockGetPscValidationMessages).toHaveBeenCalledWith("no-name-mismatch-reason");
    });

    it("Should return the correct DOB validation message", () => {
        const result = getDobValidationMessage();
        expect(result).toEqual(["The details linked to this personal code do not match the details on our records"]);
        expect(mockGetPscValidationMessages).toHaveBeenCalledTimes(1);
        expect(mockGetPscValidationMessages).toHaveBeenCalledWith("dob-mismatch");
    });

    it("Should return the correct UVID validation messages", () => {
        const result = getUvidValidationMessages();
        expect(result).toEqual([
            "UVID is not recognised",
            "UVID has expired",
            "UVID is invalid"
        ]);
        expect(mockGetPscValidationMessages).toHaveBeenCalledTimes(3);
        expect(mockGetPscValidationMessages).toHaveBeenCalledWith("unknown-uvid");
        expect(mockGetPscValidationMessages).toHaveBeenCalledWith("expired-uvid");
        expect(mockGetPscValidationMessages).toHaveBeenCalledWith("invalid-record");
    });

});
