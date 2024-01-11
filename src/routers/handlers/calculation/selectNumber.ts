import { Request, Response } from "express";
import logger from "./../../../lib/Logger";
import { GenericHandler } from "./../generic";
import { NumberFormsValidator } from "./../../../lib/validation/formValidators/number";

export class SelectNumberHandler extends GenericHandler {

    validator: NumberFormsValidator;

    constructor () {
        super();
        this.validator = new NumberFormsValidator();
        this.viewData.title = "Select a number";
        this.viewData.sampleKey = "Select a number between 1 and 100.";
    }

    // process request here and return data for the view
    public async execute (req: Request, response: Response, method: string = "GET"): Promise<any> {
        logger.info(`${method} request to select a number`);
        try {
            if (method !== "POST") {
                return this.viewData;
            }
            this.viewData.payload = req.body;
            await this.validator.validateChosenNumber(req.body);
            this.viewData.dataSaved = true;
        } catch (err: any) {
            logger.error(`error selecting a number: ${err}`);
            this.viewData.errors = this.processHandlerException(err);

            const errLength = this.viewData.errors.length;
            console.log("viewdata eerrores " + errLength);
        }
        return this.viewData;
    }
};
