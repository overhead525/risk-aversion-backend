import * as mongoose from "mongoose";

export interface Picture {
  img: {
    data: Buffer;
    contentType: String;
  };
}

const pictureSchema = new mongoose.Schema({
  img: {
    data: Buffer,
    contentType: String,
  },
});

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  simulations: [{ simName: String, simID: String, simPic: pictureSchema }],
});

export type UserDocument = mongoose.Document & {
  username: string;
  email?: string;
  password: string;
  simulations?: [{ simName: string; simID: string; simPic: Picture }];
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
