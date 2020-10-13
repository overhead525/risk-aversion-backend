import * as mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    simulations: [{ simName: String, simID: String }]
});

export type UserDocument = mongoose.Document & {
    username: string;
    email?: string;
    password: string;
    simulations?: [{ simName: string, simID: string }]
}

export const User = mongoose.model("User", userSchema, "users");

const refreshTokenSchema = new mongoose.Schema({
    token: String,
});

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema, "tokens");
