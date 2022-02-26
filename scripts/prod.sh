#!/bin/sh

joy aws-cli s3 sync ./dist s3://www.spacestation23.com --cache-control max-age=31536000 --acl public-read --profile ss23
joy aws-cli s3 cp s3://www.spacestation23.com/index s3://www.spacestation23.com/index --cache-control max-age=31536000 --content-type text/html --acl public-read --profile ss23
echo "User-agent: *\nAllow: /" | joy aws-cli s3 cp - s3://www.spacestation23.com/robots.txt --cache-control max-age=31536000 --content-type text/plain --acl public-read --profile ss23
joy aws-cli cloudfront create-invalidation --distribution-id E2BPBOUKVVHJIF --paths "/index" "/feed.xml" --profile ss23
