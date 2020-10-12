import { config } from "dotenv";
config();

import * as express from "express";

// Routes
import core from "./core";

const app = express();

app.use(express.json());

app.use("/graphql", core);

app.listen(3000, () => console.log("server running on port 3000 🚀"));
