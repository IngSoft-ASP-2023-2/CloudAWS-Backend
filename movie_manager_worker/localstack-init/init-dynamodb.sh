#!/bin/bash
echo "Creating DynamoDB table: movie-manager-test"

awslocal dynamodb create-table \
    --table-name movie-manager-test \
    --attribute-definitions AttributeName=key,AttributeType=S \
    --key-schema AttributeName=key,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1

echo "DynamoDB table created successfully"
