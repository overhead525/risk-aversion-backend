import { config } from "dotenv";
config();

import * as express from "express";

// Routes
import auth from "./auth";

const app = express();

app.use(express.json());

app.use("/auth", auth);

app.listen(4000, () => console.log("server running on port 4000 🚀"));
