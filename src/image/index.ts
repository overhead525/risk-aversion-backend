import * as express from "express";
import { Picture } from "../models";
import { authenticateToken } from "../auth/helpers";

const router = express.Router();

// This route is responsible for sending image URLs stored in MongoDB
// associated with particular simulation IDs

router.get("/hello", async (req, res) => {
  await setTimeout(() => {
    res.send("World!");
  }, 2000);
});

router.get(
  "/:simID",
  authenticateToken,
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const pictureDoc = await Picture.findOne({ simID: req.params.simID });
      if (!pictureDoc) return res.sendStatus(404);
      return res.send(pictureDoc.get("imgURL"));
    } catch (error) {
      return res.sendStatus(500);
    }
  }
);

export default router;
