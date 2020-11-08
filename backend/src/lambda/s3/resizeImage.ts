import { ImageActivities } from "../../businessLayer/imageActivities";
import { Logger } from "../../utils/myLogger";

const imageActivities = new ImageActivities();

exports.handler = async function (event, context, callback) {
  Logger.getInstance().info("Processing ", event, context);

  const bucket: string = event.Records[0].s3.bucket.name;
  const object: string = event.Records[0].s3.object.key;

  Logger.getInstance().debug("bucket / object", bucket, object);

  await imageActivities.createThumbNailImage(object, bucket);

  callback(null, "Success");
};
