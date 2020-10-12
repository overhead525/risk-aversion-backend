import * as mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});

export const User = mongoose.model("User", userSchema, "users");

const refreshTokenSchema = new mongoose.Schema({
    token: String,
});

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema, "tokens");
