import { config } from "dotenv";
config();

import * as express from "express";

// Routes
import auth from "./auth";
import core from "./core";
import data from "./data";

const app = express();

app.use(express.json());

app.use("/posts", data);

app.use("/login", auth);

app.use("/graphql", core);

app.listen(3000, () => console.log("server running on port 3000 🚀"));
