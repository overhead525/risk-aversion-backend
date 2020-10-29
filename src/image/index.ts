import * as express from "express";
import { authenticateToken } from "../auth/helpers";
import { Picture } from "../models";

const router = express.Router();

router.get(
  "/:simID",
  authenticateToken,
  async (req: express.Request, res: express.Response) => {
    if (!req.params.simID)
      return res.status(400).json("No simulation ID provided!");
    const pictureDoc = await Picture.findOne({ simID: req.params.simID });
    if (!pictureDoc) return res.sendStatus(404);
    return res.json(await pictureDoc.get("imgURL"));
  }
);

router.post(
  "/:simID/:imgURL",
  authenticateToken,
  async (req: express.Request, res: express.Response) => {
    const simID = req.params.simID;
    const imgURL = decodeURI(req.params.imgURL);
    try {
      if (!simID || !imgURL)
        return res.status(400).json("Missing simID or imgURL in request");
      const pictureDoc = await Picture.findOne({ simID: simID });
      if (pictureDoc)
        return res
          .status(304)
          .json(`Picture for simulation: ${simID} already exists`);
      const newPictureParams = {
        simID,
        imgURL,
      };
      const newPicture = new Picture(newPictureParams);
      await newPicture.save();
      return res.sendStatus(200);
    } catch (error) {
      return res.sendStatus(500);
    }
  }
);

export default router;
