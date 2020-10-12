import { db } from "../../../database";

import { RefreshToken } from "../../models";

export const storeRefreshToken = (token: string) => {
    const execution = () => {
        const refreshToken = new RefreshToken({ token: token });
        refreshToken.save();
    }
    db({ callbacks: [execution] });
}
