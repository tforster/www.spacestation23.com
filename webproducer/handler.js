("use strict");

// Third party dependencies (Typically found in public NPM packages)
const WebProducer = require("@tforster/webproducer");

// Project dependencies
const Transform = require("./Transform");

/**
 * All the code needed to create a Lambda managed webhook to build Your Mental Wealth Advisors website in the cloud
 */
module.exports.build = async (event) => {
  // Capture the time for reporting purposes.
  const appStart = new Date();

  // Create an instance of the WebProducer class
  const wp = new WebProducer("./webproducer.yml", Transform);

  const options = {
    snapshot: false, // True to persist a snapshot of retrieved data. Saving is restricted to local meta paths, no S3, etc.
  };

  // Await main
  await wp.main(options);

  // Calculate the total time it took to fetch CMS data, merge with templates, concat, minify, zip, deploy, etc
  const retVal = `elapsed time to end of build ${new Date() - appStart}ms`;

  // Return a response to the caller
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: retVal,
      },
      null,
      2
    ),
  };
};
