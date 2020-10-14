import { Request, Response, NextFunction } from "express";
import { decode, verify, sign } from "jsonwebtoken";
import * as mongoose from "mongoose";

import { useDB } from "../../database";
import { RefreshToken } from "../models";
import { generateAccessToken } from "./index";

import * as jwt from 'jsonwebtoken';

export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) return res.sendStatus(401);

    verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.body.user = user;
        next();
    });
};

export const decodeToken = (
    req: Request
) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) throw new Error("no token to decode");

    const decoded = decode(token);
    return decoded;
};

export const isAuthenticated = (req: Request, res: Response, next: NextFunction): Response => {
    const authHeader = req.headers["authorization"];  // Expecting something like: "Bearer <accessToken> <refreshToken>"
    const accessToken = authHeader.split(" ")[1];
    const refreshToken = authHeader.split(" ")[2];
    if (accessToken == null) return res.status(401).json("no token provided...assuming unauthorized");

    verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (!err && user) {  // Access Token is VALID
            console.log("ACCESS TOKEN IS VALID");
            res.status(200);
            res.set('Authenticated', 'yes');
            res.send({ message: "user is authenticated through access token" });  // ✔
            next();
        }
    });

    verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {  // Something went wrong during validation
            console.log("SOMETHING WENT WRONG DURING REFRESH TOKEN VALIDATION");
            res.status(500).send({ message: "could not verify refresh token on server" });
        }
        if (!err && user) {  // Refresh Token is VALID through jwt
            console.log("REFRESH TOKEN IS VALID THROUGH JWT");
            useDB(() => {
                RefreshToken.findOne({ token: refreshToken }, async (err, refreshTokenDoc) => {
                    if (err) {
                        console.log("REFRESH TOKEN NOT FOUND IN DATABASE");
                        next();
                        res.status(401).send({ message: "could not authenticate user" })
                    }
                    if (refreshTokenDoc) {
                        
                        console.log("REFRESH TOKEN IS COMPLETELY VALID, SENDING NEW ACCESS TOKEN");
                        // Just set the response, don't send until back in route
                        const username = decode(refreshToken)["name"];
                        const newAccessToken = jwt.sign({ name: username }, process.env["ACCESS_TOKEN_SECRET"], { expiresIn: '900s' });
                        console.log(username, newAccessToken)
                        res.locals.newAccessToken = newAccessToken;
                        res.locals.refreshToken = refreshToken;
                        mongoose.connection.close();
                    }
                })
            })
        }
        res.status(401).send({ message: "could not authenticate user" });
    });
}
