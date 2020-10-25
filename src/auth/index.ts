import * as express from "express";
import { NextFunction } from "express";
import * as jwt from "jsonwebtoken";

import { User, RefreshToken } from "../models";
import { useDB } from "../../database";
import * as mongoose from "mongoose";

import { isAuthenticated } from "./helpers";

const router = express.Router();

// This route is basically for use by client to tell if user is already logged in or not
router.get("/", isAuthenticated, (req: express.Request, res: express.Response, next: NextFunction) => {
    if (res.locals.newAccessToken && res.locals.refreshToken) {
        return res.status(200).json({
            accessToken: res.locals.newAccessToken,
            refreshToken: res.locals.refreshToken
        });
    }
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(500).json({ message: "something went wrong during authentication. Log in again please" });
});

router.post("/login", (req: express.Request, res: express.Response, next: NextFunction) => {
    if (req.body.username && req.body.password) {
        const username = req.body.username;
        const password = req.body.password;

        useDB(() => {
            User.findOne({ username, password }, async (err, userDoc) => {
                if (err) {
                    res.status(500).json({ message: "something went wrong with the request" });
                    await mongoose.connection.close();
                    return next(err);
                }
                if (!userDoc) {
                    res.status(401).json({ message: "cannot authenticate user" });
                    await mongoose.connection.close();
                    return next(null);
                }
                const user = { name: username };
        
                const accessToken = generateAccessToken(user);
                const refreshToken = generateRefreshToken(user);
                const newRefreshToken = new RefreshToken({ token: refreshToken });
                await newRefreshToken.save();
                
                res.json({ accessToken: accessToken, refreshToken: refreshToken });
                await mongoose.connection.close();
            })
        })
    } else {
        res.status(400).json("request was missing one of required parameters");
    }
});

router.post("/register", (req: express.Request, res: express.Response, next: NextFunction) => {
    if (req.body.username && req.body.password) {
        const username = req.body.username;
        const password = req.body.password;

        useDB(() => {
            User.findOne({ username, password }, async (err, userDoc) => {
                if (err) {
                    res.status(500).json({ message: "something went wrong with the request" });
                    await mongoose.connection.close();
                }
                if (userDoc) {
                    res.status(304).json("did not register user since user already exists");
                    await mongoose.connection.close();
                }
                const newUser = new User({ username, password });
                await newUser.save();

                const user = { name: username };
            
                const accessToken = generateAccessToken(user);
                const refreshToken = generateRefreshToken(user);
                const newRefreshToken = new RefreshToken({ token: refreshToken });
                await newRefreshToken.save();

                res.json({ accessToken: accessToken, refreshToken: refreshToken });
                await mongoose.connection.close();
            })
        });
    } else {
        res.status(403).json("the request was missing the required parameters");
    }
});

// Get a new access token if needed, as long as refresh token is valid
router.post("/token", (req: express.Request, res: express.Response) => {
    if (req.body.token) {
        const refreshToken = req.body.token;
        useDB(() => {
            RefreshToken.findOne({ token: refreshToken }, async (err: Error, doc: mongoose.Document) => {
                if (!doc) {
                    await mongoose.connection.close();
                    return res.status(403).json("refresh token not found")
                };
                jwt.verify(refreshToken, process.env["REFRESH_TOKEN_SECRET"], async (err, user) => {
                    if (err) {
                        await mongoose.connection.close();
                        return res.status(403).json("")
                    };
                    const accessToken = generateAccessToken({ name: user.name });
                    res.json({ accessToken: accessToken });
                })
                await mongoose.connection.close();
            });
        })
    } else {
        res.status(400).json("request was missing one of required parameters")
    }
});

router.post("/logout", (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.body.token) {
        const refreshToken = req.body.token;
        useDB(() => {
            RefreshToken.findOne({ token: refreshToken }, async (err: Error, doc: mongoose.Document) => {
                if (err) {
                    res.status(500).json("could not logout correctly");
                    await mongoose.connection.close();
                }
                else if (!doc) {
                    res.status(204).json("refresh token not found");
                    await mongoose.connection.close();
                } else {
                    await doc.remove();
                    res.status(200).json("refresh token successfully deleted");
                    await mongoose.connection.close();
                };
            })
        });
    } else {
        res.status(403).json("request missing required parameter(s)");
    }
});

export const generateAccessToken = (user: { name: string }) => {
    return jwt.sign(user, process.env["ACCESS_TOKEN_SECRET"], { expiresIn: '900s' });
}

const generateRefreshToken = (user: { name: string }) => {
    return jwt.sign(user, process.env["REFRESH_TOKEN_SECRET"], { expiresIn: '4 hours' });
}

export default router;
