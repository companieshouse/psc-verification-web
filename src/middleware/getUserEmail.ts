import { NextFunction, Request, Response } from "express";

export const getUserEmail = (req: Request, res: Response, next: NextFunction) => {
    const { signin_info: signInInfo } = req.session?.data ?? {};
    const isSignedIn = signInInfo?.signed_in !== undefined;

    if (isSignedIn) {
        res.locals.userEmail = signInInfo?.user_profile?.email;
    }

    next();
};
