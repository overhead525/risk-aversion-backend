import { config } from "dotenv";
config();

import * as express from "express";
import * as morgan from "morgan";
import { allowHeader } from "./auth/helpers";

// Routes
import core from "./core";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use("/graphql", allowHeader, core);

app.listen(3000, () => console.log("server running on port 3000 🚀"));
