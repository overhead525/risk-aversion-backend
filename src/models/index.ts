import * as mongoose from "mongoose";

export type TradingProfileDocument = mongoose.Document & {
  risk: number;
  reward: number;
  winPercentage: number;
  lossPercentage: number;
};

const tradingProfileSchema = new mongoose.Schema({
  risk: Number,
  reward: Number,
  winPercentage: Number,
  lossPercentage: Number,
});

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  simulations: [{ simName: String, simID: String }],
  tradingProfile: tradingProfileSchema,
});

export type UserDocument = mongoose.Document & {
  username: string;
  email?: string;
  password: string;
  simulations?: [{ simName: string; simID: string }];
  tradingProfile?: {
    risk: number;
    reward: number;
    winPercentage: number;
    lossPercentage: number;
  };
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

export type PictureDocument = mongoose.Document & {
  simID: string;
  img: {
    data: String;
    contentType: String;
  };
};

const pictureSchema = new mongoose.Schema({
  simID: String,
  img: {
    data: String,
    contentType: String,
  },
});

export const Picture = mongoose.model("Picture", pictureSchema, "resource");
