#!/bin/bash
echo "Creating DynamoDB table: movies"

awslocal dynamodb create-table \
    --table-name movies \
    --attribute-definitions AttributeName=movie_id,AttributeType=S \
    --key-schema AttributeName=movie_id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1

echo "DynamoDB table created successfully"
