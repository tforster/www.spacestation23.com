#!/bin/bash
####################################################################################################################################
# prod.sh: Synchronise the built files in /dist to the production bucket and invalidate the CloudFront cache.
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
joy aws-cli s3 sync ./dist s3://www.spacestation23.com --cache-control max-age=31536000 --acl public-read --profile ss23

# Separate copy for index in order that we may also force its content-type to text/html
joy aws-cli s3 cp s3://www.spacestation23.com/index s3://www.spacestation23.com/index --cache-control max-age=31536000 --content-type text/html --acl public-read --profile ss23

# Force robots.txt to allow indexing (denied by default so that non-production sites do not get indexed)
echo "User-agent: *\nAllow: /" | joy aws-cli s3 cp - s3://www.spacestation23.com/robots.txt --cache-control max-age=31536000 --content-type text/plain --acl public-read --profile ss23

# Invalidate the CloudFront cache
joy aws-cli cloudfront create-invalidation --distribution-id E2BPBOUKVVHJIF --paths "/index" "/feed.xml" --profile ss23
