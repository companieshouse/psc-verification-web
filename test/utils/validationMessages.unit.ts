import { getPscValidationMessage } from "../../src/config/api.enumerations";
import { getDobValidationMessage, getNameValidationMessage, getUvidValidationMessages } from "../../src/utils/validationMessages";

jest.mock("../../src/config/api.enumerations", () => ({
    getPscValidationMessage: jest.fn()
}));

describe("getNameValidationMessages", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockGetPscValidationMessage = getPscValidationMessage as jest.Mock;

    // Set up the mock to return specific values for each key
    mockGetPscValidationMessage.mockImplementation((key: string) => {
        const mockPscVerification: { [key: string]: string } = {
            "no-name-mismatch-reason": "No name mismatch reason provided",
            "dob-mismatch": "The details linked to this personal code do not match the details on our records",
            "unknown-uvid": "UVID is not recognised",
            "expired-uvid": "UVID has expired",
            "invalid-record": "UVID is invalid"
        };
        return mockPscVerification[key] || key;
    });

    it("Should return the correct name validation messages", () => {
        const result = getNameValidationMessage();
        expect(result).toEqual([
            "No name mismatch reason provided"
        ]);
        expect(mockGetPscValidationMessage).toHaveBeenCalledTimes(1);
        expect(mockGetPscValidationMessage).toHaveBeenCalledWith("no-name-mismatch-reason");
    });

    it("Should return the correct DOB validation message", () => {
        const result = getDobValidationMessage();
        expect(result).toEqual(["The details linked to this personal code do not match the details on our records"]);
        expect(mockGetPscValidationMessage).toHaveBeenCalledTimes(1);
        expect(mockGetPscValidationMessage).toHaveBeenCalledWith("dob-mismatch");
    });

    it("Should return the correct UVID validation messages", () => {
        const result = getUvidValidationMessages();
        expect(result).toEqual([
            "UVID is not recognised",
            "UVID has expired",
            "UVID is invalid"
        ]);
        expect(mockGetPscValidationMessage).toHaveBeenCalledTimes(3);
        expect(mockGetPscValidationMessage).toHaveBeenCalledWith("unknown-uvid");
        expect(mockGetPscValidationMessage).toHaveBeenCalledWith("expired-uvid");
        expect(mockGetPscValidationMessage).toHaveBeenCalledWith("invalid-record");
    });

});
