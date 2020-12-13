#!/bin/bash

# USAGE: Use with npm as: npm run deploy {target}
# The npm wrapper takes care of the environment variables
# The bucket is defined in .env and the target is $1, falling back to "dev"
DEPLOY_TARGET=${1:-"dev"}

# Synchronise the templates and other source files, deleting unused files
aws s3 sync ./src s3://$DEPLOY_BUCKET/$DEPLOY_TARGET \
  --profile=$DEPLOY_PROFILE \
  --delete
