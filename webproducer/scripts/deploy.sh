#!/bin/bash

################################################################################
# Deploy a new Lambda containing the latest web source files and WebProducer   #
# NPM module. Note that it will be necessary to invoke the webhook following a #
# call to this script to ensure the web is updated                             #
################################################################################

# USAGE: Use with npm as: npm run deploy {target}
# The npm wrapper takes care of the environment variables
# The target is $1, falling back to "dev"
# The target specified in $1 must match the STAGE variable in webproducer/.env to help avoid accidental misdeploys.
DEPLOY_TARGET=${1:-"dev"}

# If deploying to Production
if [ $DEPLOY_TARGET = "prod" ]; then
  if [ $STAGE = "prod" ]; then
    cd webproducer && sls deploy --aws-profile spacestation23
  else
    echo "STAGE environment variable mismatch. Confirm the STAGE variable in webproducer/.env is set to 'prod'."
  fi

# If deploying to Stage
elif [ $DEPLOY_TARGET = "stage" ]; then
  if [ $STAGE = "stage" ]; then
    cd webproducer && sls deploy --aws-profile spacestation23
  else
    echo "STAGE environment variable mismatch. Confirm the STAGE variable in webproducer/.env is set to 'stage'."
  fi

# If deploying to Development
else
  echo "Nothing required to deploy to dev."
fi
