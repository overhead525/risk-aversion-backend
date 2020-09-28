import * as express from "express";

import posts from "../../data/posts";
import { authenticateToken } from "../auth/helpers";

const router = express.Router();

interface PostAppRequest extends express.Request {
    user: {
        name: string;
    };
}

router.get(
    "/",
    authenticateToken,
    (req: PostAppRequest, res: express.Response) => {
        res.json(posts.filter((post) => post.username === req.user.name));
    }
);

export default router;
