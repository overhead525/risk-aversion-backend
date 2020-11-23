import { Request, Response, NextFunction } from "express";
import { decode, verify, sign } from "jsonwebtoken";

import { RefreshToken } from "../models";

import * as jwt from "jsonwebtoken";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      res.status(403).json(err);
    }
    req.body.user = user;
    next();
  });
};

export const decodeToken = (req: Request) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) throw new Error("no token to decode");

  const decoded = decode(token);
  return decoded;
};

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  const authHeader = req.headers["authorization"]; // Expecting something like: "Bearer <accessToken> <refreshToken>"
  const accessToken = authHeader.split(" ")[1];
  const refreshToken = authHeader.split(" ")[2];
  if (accessToken == null)
    return res
      .status(401)
      .json("no access token provided...assuming unauthorized");
  if (refreshToken == null)
    return res
      .status(401)
      .json("no refresh token provided...assuming unauthorized");
  verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (!err && user) {
      // Access Token is VALID
      console.log("ACCESS TOKEN IS VALID");
      res.status(200);
      res.set("Authenticated", "yes");
      return res.send({
        message: "user is authenticated through access token",
      }); // ✔
    }
  });

  verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      // Something went wrong during validation
      console.log("SOMETHING WENT WRONG DURING REFRESH TOKEN VALIDATION");
      console.error(err);
      // res.status(500).send({ message: "could not verify refresh token on server" });
      return next();
    }
    if (!err && user) {
      // Refresh Token is VALID through jwt
      console.log("REFRESH TOKEN IS VALID THROUGH JWT");
      RefreshToken.findOne(
        { token: refreshToken },
        async (err, refreshTokenDoc) => {
          if (err) {
            console.log("REFRESH TOKEN NOT FOUND IN DATABASE");
            // res.status(401).send({ message: "could not authenticate user" })
            return next();
          }
          if (refreshTokenDoc) {
            console.log(
              "REFRESH TOKEN IS COMPLETELY VALID, SENDING NEW ACCESS TOKEN"
            );
            // Just set the response, don't send until back in route
            const username = decode(refreshToken)["name"];
            const newAccessToken = jwt.sign(
              { name: username },
              process.env["ACCESS_TOKEN_SECRET"],
              { expiresIn: "900s" }
            );
            console.log(username, newAccessToken);
            res.locals.newAccessToken = newAccessToken;
            res.locals.refreshToken = refreshToken;
            return next();
          }
        }
      );
    }
    // res.status(401).send({ message: "could not authenticate user" });
    return next();
  });
};

export const allowHeader = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.append("Access-Control-Allow-Origin", "http://localhost:5000");
  res.append("Access-Control-Allow-Methods", "POST, GET");
  res.append("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return next();
};
