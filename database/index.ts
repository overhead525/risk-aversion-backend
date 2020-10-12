import * as mongoose from "mongoose";
require("dotenv").config();

type CallBacksArr = Array<() => any | (() => Promise<any>)>;

interface dbProps {
    callbacks: CallBacksArr;
}

const exampleCallback = async () => {
    console.log("connection has been made");
    const collections = await mongoose.connection.db
        .listCollections()
        .toArray();
    console.log(collections);
};

const dbObject: dbProps = {
    callbacks: [exampleCallback],
};

export const db = (dbconfig: dbProps) => {
    mongoose.connect(process.env["DATABASE_URL"], {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    mongoose.connection
        .once("open", () => {
            try {
                const callbacks: CallBacksArr = dbconfig.callbacks;
                callbacks.forEach((callback) => {
                    callback();
                });
            } catch (error) {
                throw new Error(
                    "There was a problem with one of your callbacks"
                );
            }
        })
        .on("error", (error) => {
            console.log("error is", error);
        });
};
