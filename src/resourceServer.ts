import { config } from "dotenv";
config();

import * as express from "express";
import * as morgan from "morgan";
import { allowHeader, authenticateToken } from "./auth/helpers";

// Routes
import resource from "./resource";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use("/resource", allowHeader, authenticateToken, resource);

app.listen(6000, () => console.log("Resource server running on port 6000 🪓"));
