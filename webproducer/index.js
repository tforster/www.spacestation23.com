("use strict");

// System dependencies
const path = require("path");

// Third party dependencies
const WebProducer = require("@tforster/webproducer");

// Project dependencies
const Transform = require("./Transform");

const globs = {
  styles: {
    "/styles.min.css": ["/**/*.css"],
  },
  scripts: {
    "/main.min.js": ["/**/*.js"],
  },
};
// Create an instance of the WebProducer class
const wp = new WebProducer(path.resolve("webproducer/webproducer.yml"), Transform, globs);

const options = {
  snapshot: false, // True to persist a snapshot of retrieved data. Saving is restricted to local meta paths, no S3, etc.,
};

// Execute WebProducer's default build() feature by way of main()
wp.main(options)
  .then((result) => {
    console.log(result);
  })
  .catch(console.error);
