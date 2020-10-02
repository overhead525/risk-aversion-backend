import mongoose from "mongoose";

// username
// root

// password
// Q3cuLOWpHMpFhd6D

mongoose.connect(
    "mongodb+srv://root:<Q3cuLOWpHMpFhd6D>@risk-aversion-backend-d.shiry.azure.mongodb.net/<risk-aversion-data.users>?retryWrites=true&w=majority"
);

mongoose.connection
    .once("open", () => {
        console.log("connection has been made");
    })
    .on("error", (error) => {
        console.log("error is", error);
    });
