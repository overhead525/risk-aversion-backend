import * as express from "express";
import { NextFunction } from "express";
import * as jwt from "jsonwebtoken";

import { RefreshToken, UserDocument } from "../models";

import { deleteRefreshToken, storeRefreshToken } from "../data/operations/tokenOperations";
import { createNewUser, deleteExistingUser, doesUserExist } from "../data/operations/userOperations";

const router = express.Router();

router.post("/login", (req: express.Request, res: express.Response, next: NextFunction) => {
    const username = req.body.username;
    const user = { name: username };

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    storeRefreshToken(refreshToken);
    
    res.json({ accessToken: accessToken, refreshToken: refreshToken });
});

// Get a new access token if needed, as long as refresh token is valid
router.post("/token", (req: express.Request, res: express.Response) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);
    const tokenExists = RefreshToken.findOne({ token: refreshToken }, (err: Error, doc: Document) => {
        if (!doc) return false;
        return true;
    });
    if (!tokenExists) return res.sendStatus(403);
    jwt.verify(refreshToken, process.env["REFRESH_TOKEN_SECRET"], (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = generateAccessToken({ name: user.name });
        res.json({ accessToken: accessToken });
    })
});

router.delete("/logout", (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        // WEAKNESS: Server does not know if token exists or not and doesn't handle every use case
        deleteRefreshToken(req.body.token);
        return res.sendStatus(200);
    } catch (error) {
        return res.sendStatus(500).json({ message: "could not delete that token" })
    }
})

const generateAccessToken = (user: { name: string }) => {
    return jwt.sign(user, process.env["ACCESS_TOKEN_SECRET"], { expiresIn: '60s' });
}

const generateRefreshToken = (user: { name: string }) => {
    return jwt.sign(user, process.env["REFRESH_TOKEN_SECRET"]);
}

export default router;
