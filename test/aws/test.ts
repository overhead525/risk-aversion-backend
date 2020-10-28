import * as AWS from "aws-sdk";
import * as fs from "fs";
import * as path from "path";

AWS.config.update({ region: "us-east-1" });

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

s3.listBuckets((err, data) => {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data.Buckets);
  }
});

const uploadParams = { Bucket: process.argv[2], Key: "", Body: "" };
const file = process.argv[3];

const fileStream = fs.createReadStream(file);
fileStream.on("error", (err) => {
  console.log("File error", err);
});
// @ts-ignore
uploadParams.Body = fileStream;
uploadParams.Key = path.basename(file);

/*
s3.upload(uploadParams, (err, data) => {
  if (err) console.log("Error", err);
  if (data) console.log("Upload Success", data.Location);
});
*/

s3.listObjects({ Bucket: "simulation-images" }, (err, data) => {
  if (err) console.log("Error", err);
  if (data) console.log("Success", data);
});
