#!/bin/sh

aws s3 sync ./dist s3://www.stage.spacestation23.com --cache-control max-age=31536000 --acl public-read --profile ss23
aws s3 cp s3://www.stage.spacestation23.com/index s3://www.stage.spacestation23.com/index --cache-control max-age=31536000 --content-type text/html --acl public-read --profile ss23
