#!/bin/bash

################################################################################
# Build a new web at the specified target using the existing web source files  #
# and NPM module but with whatever the latest data may be.                     #
################################################################################

# USAGE: Use with npm as: npm run publish {target}
# The npm wrapper takes care of the environment variables
# The target is $1, falling back to "dev"
# The target specified in $1 must match the STAGE variable in webproducer/.env to help avoid unintended publishes.
PUBLISH_TARGET=${1:-"dev"}

# Publish to production
if [ $PUBLISH_TARGET = "prod" ]; then
  if [ $STAGE = "prod" ]; then
    curl "https://xsyxjqq6n5.execute-api.ca-central-1.amazonaws.com/prod/publish" --request POST
  else
    echo "STAGE environment variable mismatch. Confirm the STAGE variable in webproducer/.env is set to 'prod'."
  fi

# Publish to stage
elif [ $PUBLISH_TARGET = "stage" ]; then
  if [ $STAGE = "stage" ]; then
    curl "https://n5p181uic4.execute-api.ca-central-1.amazonaws.com/stage/publish" --request POST
  else
    echo "STAGE environment variable mismatch. Confirm the STAGE variable in webproducer/.env is set to 'stage'."
  fi  

# Publish locally
elif [ $PUBLISH_TARGET = "dev" ]; then
  if [ $STAGE = "dev" ]; then
    echo "ok"
  else
    echo "WARNING: STAGE environment variable mismatch."   
  fi  
  node webproducer/index
fi
