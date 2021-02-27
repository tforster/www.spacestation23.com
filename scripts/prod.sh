#!/bin/sh

aws s3 sync ./dist s3://www.spacestation23.com --cache-control max-age=31536000 --acl public-read --profile ss23
aws s3 cp s3://www.spacestation23.com/index s3://www.spacestation23.com/index --cache-control max-age=31536000 --content-type text/html --acl public-read --profile ss23
echo "User-agent: *\nAllow: /" | aws s3 cp - s3://www.spacestation23.com/robots.txt --cache-control max-age=31536000 --content-type text/plain --acl public-read --profile ss23

