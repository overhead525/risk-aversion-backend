import * as express from "express";
import * as jwt from "jsonwebtoken";
import * as passport from "passport";

import { storeRefreshToken } from "../data/operations/tokenOperations";

const router = express.Router();

router.post("/login", (req: express.Request, res: express.Response) => {
    const username = req.body.username;
    const user = { name: username };

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    storeRefreshToken(refreshToken);
    
    res.json({ accessToken: accessToken, refreshToken: refreshToken });
});

router.post("/token", (req: express.Request, res: express.Response) => {
    const refreshToken = req.body.token;
});

const generateAccessToken = (user: { name: string }) => {
    return jwt.sign(user, process.env["ACCESS_TOKEN_SECRET"], { expiresIn: '120s' });
}

const generateRefreshToken = (user: { name: string }) => {
    return jwt.sign(user, process.env["REFRESH_TOKEN_SECRET"]);
}

export default router;
