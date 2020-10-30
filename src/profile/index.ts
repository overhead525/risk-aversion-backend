import * as express from "express";
import { authenticateToken } from "../auth/helpers";
import { User, UserDocument } from "../models";

const router = express.Router();

router.get(
  "/:username",
  authenticateToken,
  async (req: express.Request, res: express.Response) => {
    if (!req.params.username) return res.sendStatus(400);
    const username = req.params.username;
    const userDoc = await User.findOne({ username });
    if (!userDoc) res.sendStatus(404);
    const userProfile = await userDoc.get("profile");
    if (!userProfile)
      return res
        .status(404)
        .json(`There was no trading profile for user: ${username}`);
    return res.json(userProfile);
  }
);

router.post(
  "/:username",
  authenticateToken,
  async (req: express.Request, res: express.Response) => {
    if (!req.params.username)
      return res.status(400).send("No username provided");
    if (!req.body)
      return res.status(400).send("No profile properties in request body");

    try {
      const username = req.params.username;
      const newProfile = req.body;
      delete newProfile.user;

      // @ts-ignore
      const userDoc: UserDocument = await User.findOne({
        username,
      });
      if (!userDoc) return res.sendStatus(404);

      userDoc.profile = {
        ...userDoc.profile,
        ...newProfile,
      };

      await userDoc.save();
      return res.send(
        `Successfully updated trading profile for user: ${username}`
      );
    } catch (error) {
      console.log("Error: ", error);
      return res.sendStatus(500);
    }
  }
);

export default router;
