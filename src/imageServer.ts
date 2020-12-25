import { config } from "dotenv";
config();

import * as express from "express";
import * as mongoose from "mongoose";
import * as morgan from "morgan";
import { allowHeader } from "./auth/helpers";

// Routes
import image from "./image";

const app = express();

mongoose
  .connect(process.env["DATABASE_URL"], {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.use(express.json());
    app.use(morgan("dev"));

    app.use("/image", allowHeader, image);

    app.listen(5050, () => {
      console.log(`server running on port 5050 🚀`);
      if (process.argv[2] && process.argv[2] === "temp") {
        console.log("image server started successfully. Exiting...");
        return process.exit(0);
      }
    });
  });
