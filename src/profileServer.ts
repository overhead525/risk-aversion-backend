import { config } from "dotenv";
config();

import * as bodyParser from "body-parser";
import * as express from "express";
import * as mongoose from "mongoose";
import * as morgan from "morgan";
import { allowHeader } from "./auth/helpers";

// Routes
import profile from "./profile";

const app = express();

const jsonParser = bodyParser.json();

mongoose
  .connect(process.env["DATABASE_URL"], {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.use(express.json());
    app.use(morgan("dev"));

    app.use("/profile", allowHeader, jsonParser, profile);

    app.listen(4500, () => console.log("server running on port 4500"));
  });
