import * as express from "express";
import * as mongoose from "mongoose";
import { useDB } from "../../database";
import { Picture } from "../models";

const router = express.Router();

router.get(
  "/image/:simID",
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      useDB(() => {
        Picture.findOne({ simID: req.params.sidID }).then(async (data) => {
          await mongoose.connection.close();
          res.send(data);
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Could not get image");
    }
  }
);

router.post(
  "/image/:simID",
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const testImage = new Picture({
        simID: req.params.simID,
        img: {
          data: req.body.data,
          contentType: "img/png",
        },
      });
      useDB(async () => {
        await testImage.save();
        await mongoose.connection.close();
      });
      res.send("Successfully saved picture");
    } catch (error) {
      console.error(error);
      res.status(500).send("Could not save image");
    }
  }
);

export default router;
