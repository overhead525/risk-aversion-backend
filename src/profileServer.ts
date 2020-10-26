import { config } from "dotenv";
config();

import * as express from "express";
import * as morgan from "morgan";
import { allowHeader, authenticateToken } from "./auth/helpers";

// Routes
import profile from "./profile";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use("/profile", allowHeader, authenticateToken, profile);

app.listen(7000, () => console.log("Profile server running on port 7000 🧱"));
