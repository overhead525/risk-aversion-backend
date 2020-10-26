import * as express from "express";
import * as mongoose from "mongoose";
import { useDB } from "../../database";
import { User, UserDocument } from "../models";

const router = express.Router();

router.get(
  "/:username",
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    useDB(() => {
      User.findOne({ username: req.params.username })
        .then((user: UserDocument) => {
          res.status(200).send(user.toJSON());
        })
        .then(() => mongoose.connection.close())
        .catch((err) => {
          res.status(404).send(`Could not find user ${req.params.username}`);
          console.error(err);
        });
    });
  }
);

router.post(
  "/:username",
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    useDB(() => {
      User.findOne({ username: req.params.username })
        .then((user: UserDocument) => {
          const tradingProfileChanges = {
            risk: req.body.risk,
            reward: req.body.reward,
            winPercentage: req.body.winPercentage,
            lossPercentage: req.body.lossPercentage,
          };
          user.tradingProfile = tradingProfileChanges;
          return user;
        })
        .then((user) => user.save())
        .then(() => {
          res
            .status(200)
            .send(
              `Successfully updated trading profile of user: ${req.params.username}`
            );
        })
        .then(() => mongoose.connection.close())
        .catch((err) => {
          res
            .status(500)
            .send(
              `Could not update the trading profile of user: ${req.params.username}`
            );
          console.error(err);
        });
    });
  }
);

export default router;
