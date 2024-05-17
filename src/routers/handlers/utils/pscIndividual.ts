import { Request } from "express";
import { Resource } from "@companieshouse/api-sdk-node";
import { getPscIndividual } from "../../../services/pscService";
import { getPscVerification } from "../../../services/pscVerificationService";
import { PersonWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/psc/types";

export const getPscIndividualDetails = async (req: Request, transactionId: string, submissionId: string): Promise<Resource<PersonWithSignificantControl>> => {

    const verificationResponse = await getPscVerification(req, transactionId, submissionId);
    const pscDetailsResponse = await getPscIndividual(req, verificationResponse.resource?.data.company_number as string,
                                            verificationResponse.resource?.data.psc_appointment_id as string);

    return pscDetailsResponse;
};
