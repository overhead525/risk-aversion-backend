import * as mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  firstName: String,
  tradingHabits: {
    risk: Number,
    reward: Number,
    lossPercentage: Number,
    winPercentage: Number,
  },
  goalPortfolio: Number,
});

export interface Profile {
  firstName: string;
  tradingHabits: {
    risk: number;
    reward: number;
    lossPercentage: number;
    winPercentage: number;
  };
  goalPortfolio: number;
}

export type ProfileDocument = mongoose.Document & {
  firstName: string;
  tradingHabits: {
    risk: number;
    reward: number;
    lossPercentage: number;
    winPercentage: number;
  };
  goalPortfolio: number;
};

const pictureSchema = new mongoose.Schema({
  simID: String,
  imgURL: String,
});

export type PictureDocument = mongoose.Document & {
  simID: string;
  imgURL: string;
};

export const Picture = mongoose.model("Picture", pictureSchema, "resource");

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  simulations: [{ simName: String, simID: String }],
  profile: profileSchema,
});

export type UserDocument = mongoose.Document & {
  username: string;
  email?: string;
  password: string;
  simulations?: [{ simName: string; simID: string }];
  profile?: Profile;
};

export const User = mongoose.model("User", userSchema, "users");

const refreshTokenSchema = new mongoose.Schema({
  token: String,
});

export const RefreshToken = mongoose.model(
  "RefreshToken",
  refreshTokenSchema,
  "tokens"
);
