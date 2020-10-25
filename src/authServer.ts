import { config } from "dotenv";
config();

import * as express from "express";
import * as morgan from "morgan";

// Middlewares
import { allowHeader } from "./auth/helpers";

// Routes
import auth from "./auth";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use("/auth", allowHeader, auth);

app.listen(4000, () => console.log("server running on port 4000 🚀"));
