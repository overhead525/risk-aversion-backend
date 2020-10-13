import * as express from "express";
import { NextFunction } from "express";
import * as jwt from "jsonwebtoken";

import { User, RefreshToken, UserDocument } from "../models";
import { useDB } from "../../database";
import { deleteRefreshToken, storeRefreshToken } from "../data/operations/tokenOperations";
import * as mongoose from "mongoose";

const router = express.Router();

router.post("/login", (req: express.Request, res: express.Response, next: NextFunction) => {
    if (req.body.username && req.body.password) {
        const username = req.body.username;
        const password = req.body.password;

        useDB(() => {
            User.findOne({ username, password }, (err, userDoc) => {
                if (err) {
                    res.status(500).json({ message: "something went wrong with the request" });
                    return next(err);
                }
                if (!userDoc) {
                    res.status(401).json({ message: "cannot authenticate user" });
                    return next(null);
                }
                const user = { name: username };
        
                const accessToken = generateAccessToken(user);
                const refreshToken = generateRefreshToken(user);
                storeRefreshToken(refreshToken);
                res.json({ accessToken: accessToken, refreshToken: refreshToken });
                mongoose.connection.close();
            })
        })
    } else {
        res.status(400).json("request was missing one of required parameters");
    }
});

// Get a new access token if needed, as long as refresh token is valid
router.post("/token", (req: express.Request, res: express.Response) => {
    if (req.body.token) {
        const refreshToken = req.body.token;
        useDB(() => {
            RefreshToken.findOne({ token: refreshToken }, (err: Error, doc: Document) => {
                if (!doc) return res.status(403).json("refresh token not found");
                jwt.verify(refreshToken, process.env["REFRESH_TOKEN_SECRET"], (err, user) => {
                    if (err) return res.status(403).json("")
                    const accessToken = generateAccessToken({ name: user.name });
                    res.json({ accessToken: accessToken });
                })
                mongoose.connection.close();
            });
        })
    } else {
        res.status(400).json("request was missing one of required parameters")
    }
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
