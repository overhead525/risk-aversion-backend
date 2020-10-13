import { db } from "../../../database";

import { RefreshToken } from "../../models";

export const storeRefreshToken = (token: string) => {
    const execution = () => {
        const refreshToken = new RefreshToken({ token: token });
        refreshToken.save();
    }
    db({ callbacks: [execution] });
}

export const deleteRefreshToken = (token: string) => {
    const execution = () => {
        RefreshToken.deleteMany({ token: token }, (err: Error) => {
            if (err) return err;
        })
    }
    db({ callbacks: [execution] });
}
