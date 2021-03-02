import AWS from "aws-sdk";

let config = {};

if (process.env.AWS === "true" || process.env.AWS_STAGING === "true") {
  config = {region: process.env.BUCKETEER_AWS_REGION };
} else {
  config = {
    accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
    region: process.env.BUCKETEER_AWS_REGION,
  };
}

// Inititialize AWS
const s3 = new AWS.S3(config);

exports.s3 = s3;
