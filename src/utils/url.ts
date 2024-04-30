export const getUrlWithTransactionIdAndSubmissionId = (url: string, transactionId: string, submissionId: string): string => {
    url = url
        .replace(":transactionId", transactionId)
        .replace(":submissionId", submissionId);
    return url;
};
