import { STOP_TYPE } from "../constants";

export const getUrlWithTransactionIdAndSubmissionId = (url: string, transactionId: string, submissionId: string): string => {
    url = url
        .replace(":transactionId", transactionId)
        .replace(":submissionId", submissionId);
    return url;
};

export const getUrlWithStopType = (url: string, stopType: STOP_TYPE): string => {
    url = url.replace(":stopType", stopType.valueOf());

    return url;
};
