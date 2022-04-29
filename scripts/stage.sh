#!/bin/bash
####################################################################################################################################
# stage.sh: Synchronise the built files in /dist to the stage bucket
#
####################################################################################################################################
set -euo pipefail

# Export .env variables
set -o allexport
source .env
set +o allexport

aws() {
  docker run --rm -it -v ~/.aws:/root/.aws -v $(pwd):/aws amazon/aws-cli $@
}

# Copy all files that have changed since the last time sync ran 
aws s3 sync ./dist s3://www.stage.spacestation23.com --cache-control max-age=31536000 --acl public-read --profile ss23

# Separate copy for index in order that we may also force its content-type to text/html
aws s3 cp s3://www.stage.spacestation23.com/index s3://www.stage.spacestation23.com/index --cache-control max-age=31536000 --content-type text/html --acl public-read --profile ss23
