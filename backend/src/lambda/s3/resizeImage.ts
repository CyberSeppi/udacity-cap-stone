import { ImageActivities } from "../../businessLayer/imageActivities";

const imageActivities = new ImageActivities();

exports.handler = async function (event, context, callback) {
  console.log("Received event:", JSON.stringify(event, null, 4));
  console.log("Received event:", JSON.stringify(context, null, 4));

  const bucket:string = event.Records[0].s3.bucket.name;
  const object:string = event.Records[0].s3.object.key;
  
  //parse object and get rid of path

  console.log(`bucket: ${bucket} object: ${object}`);

  await imageActivities.createThumbNailImage(object, bucket);

  callback(null, "Success");
};
