import { config } from "dotenv";
config();

import * as express from "express";
import * as mongoose from "mongoose";
import * as morgan from "morgan";

// Middlewares
import { allowHeader } from "./auth/helpers";

// Routes
import auth from "./auth";

const app = express();

mongoose
  .connect(process.env["DATABASE_URL"], {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.use(express.json());
    app.use(morgan("dev"));

    app.use("/auth", allowHeader, auth);

    app.listen(4000, () => {
      console.log(`server running on port 4000 🚀`);
      if (process.argv[2] && process.argv[2] === "temp") {
        console.log("auth server started successfully. Exiting...");
        return process.exit(0);
      }
    });
  });
