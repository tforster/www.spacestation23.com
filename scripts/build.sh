#!/bin/bash

# USAGE: Use with npm as: npm run build {target}
# The npm wrapper takes care of the environment variables
# The target is $1, falling back to "dev"
BUILD_TARGET=${1:-"dev"}

# If building for Production
if [ $BUILD_TARGET = "prod" ]; then
  curl "https://$DEPLOY_LAMBDA_ENDPOINT_PRODUCTION/$BUILD_TARGET/publish" --request POST
# If building for Stage
elif [ $BUILD_TARGET = "stage" ]; then
  curl "https://$DEPLOY_LAMBDA_ENDPOINT_STAGE/$BUILD_TARGET/publish" --request POST
# If building for Development
else
  node index
fi
