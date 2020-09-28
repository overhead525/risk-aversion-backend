import * as express from "express";
import * as jwt from "jsonwebtoken";

const router = express.Router();

router.post("/", (req: express.Request, res: express.Response) => {
    // Authenticate User

    const username = req.body.username;
    const user = { name: username };

    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    res.json({ accessToken: accessToken });
});

export default router;
