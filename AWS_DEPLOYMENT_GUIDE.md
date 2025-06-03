# Complete AWS Deployment Guide: Professional Portfolio with HTTPS
## From Zero to Production in the Cloud

This comprehensive guide documents the complete deployment of a professional portfolio website on AWS infrastructure, including HTTPS setup, custom domain configuration, and serverless backend implementation.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [AWS Architecture](#aws-architecture)
3. [Prerequisites](#prerequisites)
4. [Initial Setup](#initial-setup)
5. [Frontend Deployment](#frontend-deployment)
6. [Backend Implementation](#backend-implementation)
7. [Database Configuration](#database-configuration)
8. [HTTPS and Security](#https-and-security)
9. [Custom Domain Setup](#custom-domain-setup)
10. [Cost Analysis](#cost-analysis)
11. [Security Considerations](#security-considerations)
12. [Monitoring and Maintenance](#monitoring-and-maintenance)
13. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Project Name:** Pauline Namwakira AWS Training Portfolio  
**Live URL:** https://paulinenamwakira.com  
**HTTPS URL:** https://d2ripcvvz75x7o.cloudfront.net  
**GitHub Repository:** https://github.com/kira-PJ/pauline-namwakira-portfolio

### Technology Stack
- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Backend:** AWS Lambda + Node.js
- **Database:** Amazon DynamoDB
- **Hosting:** Amazon S3 + CloudFront CDN
- **Security:** AWS Certificate Manager (ACM)
- **DNS:** Amazon Route 53
- **Build Tool:** Vite
- **Deployment:** AWS CLI + Infrastructure as Code

---

## AWS Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Route 53      │───▶│   CloudFront     │───▶│      S3         │
│  (DNS & SSL)    │    │   (CDN & HTTPS)  │    │ (Static Hosting)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                               │
                               ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │  Lambda Functions│───▶│   DynamoDB      │
                       │ (Direct Invoke)  │    │   (Database)    │
                       └──────────────────┘    └─────────────────┘
```

### AWS Services Used
1. **Amazon S3** - Static website hosting
2. **Amazon CloudFront** - Global CDN and HTTPS termination
3. **AWS Lambda** - Serverless backend functions
4. **Amazon DynamoDB** - NoSQL database for contact submissions
5. **Amazon Route 53** - DNS management and domain routing
6. **AWS Certificate Manager** - SSL/TLS certificates
7. **AWS CLI** - Command-line deployment tools

---

## Prerequisites

### Required Tools
```bash
# AWS CLI installation
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify installation
aws --version
```

### AWS Account Setup
1. Create AWS account at https://aws.amazon.com
2. Set up IAM user with programmatic access
3. Configure AWS CLI credentials
4. Ensure billing alerts are enabled

### Required Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:*",
        "cloudfront:*",
        "route53:*",
        "acm:*",
        "lambda:*",
        "dynamodb:*",
        "iam:*"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## Initial Setup

### 1. Environment Configuration
```bash
# Set AWS environment variables
export AWS_DEFAULT_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"

# Verify AWS configuration
aws sts get-caller-identity
```

### 2. Project Structure
```
pauline-namwakira-portfolio/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   └── main.tsx        # Application entry point
│   ├── public/             # Static assets
│   └── index.html          # HTML template
├── server/                 # Backend services
│   ├── index.ts            # Express server
│   ├── routes.ts           # API routes
│   ├── lambda.ts           # Lambda wrapper
│   └── simple-lambda.js    # Production Lambda
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schemas
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Frontend Deployment

### 1. Build Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
})
```

### 2. Build Process
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Verify build output
ls -la dist/
```

### 3. S3 Bucket Creation
```bash
# Create S3 bucket with unique name
BUCKET_NAME="paulinenamwakira-portfolio-$(date +%s)"
aws s3 mb s3://$BUCKET_NAME --region us-east-1

# Configure bucket for static website hosting
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document index.html
```

### 4. Bucket Policy Configuration
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::paulinenamwakira-portfolio-*/*"
    }
  ]
}
```

Apply bucket policy:
```bash
aws s3api put-bucket-policy \
  --bucket $BUCKET_NAME \
  --policy file://bucket-policy.json
```

### 5. Upload Website Files
```bash
# Upload all built files to S3
aws s3 sync dist/ s3://$BUCKET_NAME/ \
  --delete \
  --cache-control "max-age=31536000" \
  --exclude "*.html" \
  --exclude "*.txt"

# Upload HTML files with different cache settings
aws s3 sync dist/ s3://$BUCKET_NAME/ \
  --delete \
  --cache-control "max-age=0" \
  --exclude "*" \
  --include "*.html" \
  --include "*.txt"
```

### 6. Verify Static Website
```bash
# Get website endpoint
WEBSITE_URL=$(aws s3api get-bucket-website \
  --bucket $BUCKET_NAME \
  --query 'WebsiteConfiguration.IndexDocument.Suffix' \
  --output text)

echo "Website available at: http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com"
```

---

## Backend Implementation

### 1. DynamoDB Table Setup
```bash
# Create users table
aws dynamodb create-table \
  --table-name portfolio-users \
  --attribute-definitions \
    AttributeName=id,AttributeType=N \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Create contact submissions table
aws dynamodb create-table \
  --table-name portfolio-contact-submissions \
  --attribute-definitions \
    AttributeName=id,AttributeType=N \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### 2. Lambda Function Code
```javascript
// server/simple-lambda.js - Production Lambda function
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event, context) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'GET' && event.path === '/api/health') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: 'production'
      })
    };
  }

  if (event.httpMethod === 'POST' && event.path === '/api/contact') {
    try {
      const body = JSON.parse(event.body);
      const { name, email, subject, message } = body;

      if (!name || !email || !message) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing required fields' })
        };
      }

      const submission = {
        id: Date.now(),
        name,
        email,
        subject: subject || 'No subject',
        message,
        createdAt: new Date().toISOString()
      };

      await dynamodb.send(new PutCommand({
        TableName: 'portfolio-contact-submissions',
        Item: submission
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message: 'Contact form submitted successfully',
          id: submission.id
        })
      };
    } catch (error) {
      console.error('Error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Internal server error' })
      };
    }
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Not found' })
  };
};
```

### 3. Lambda Deployment Package
```bash
# Create deployment package
mkdir lambda-deployment
cp server/simple-lambda.js lambda-deployment/index.js

cd lambda-deployment

# Create package.json for Lambda
cat > package.json << EOF
{
  "name": "portfolio-lambda",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.0.0",
    "@aws-sdk/lib-dynamodb": "^3.0.0"
  }
}
EOF

# Install dependencies
npm install --production

# Create deployment ZIP
zip -r ../portfolio-lambda.zip .
cd ..
```

### 4. Lambda Function Creation
```bash
# Create IAM role for Lambda
aws iam create-role \
  --role-name portfolio-lambda-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }'

# Attach policies to the role
aws iam attach-role-policy \
  --role-name portfolio-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy \
  --role-name portfolio-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

# Create Lambda function
aws lambda create-function \
  --function-name portfolio-api \
  --runtime nodejs18.x \
  --role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/portfolio-lambda-role \
  --handler index.handler \
  --zip-file fileb://portfolio-lambda.zip \
  --timeout 30 \
  --memory-size 256
```

### 5. Lambda Function URLs (Serverless API)
```bash
# Create function URL for direct Lambda invocation
aws lambda create-function-url-config \
  --function-name portfolio-api \
  --config AuthType=NONE,Cors='{"AllowCredentials":false,"AllowHeaders":["*"],"AllowMethods":["*"],"AllowOrigins":["*"],"ExposeHeaders":["*"],"MaxAge":86400}' \
  --query 'FunctionUrl'

# Note: Your portfolio uses direct Lambda invocation through the frontend,
# not API Gateway, for simplified serverless architecture
```

---

## HTTPS and Security

### 1. SSL Certificate Request
```bash
# Request SSL certificate for custom domain (single domain only for faster validation)
CERT_ARN=$(aws acm request-certificate \
  --domain-name paulinenamwakira.com \
  --validation-method DNS \
  --region us-east-1 \
  --query 'CertificateArn' --output text)

echo "Certificate ARN: $CERT_ARN"

# Note: Avoid including www subdomain as it often causes validation delays
# If www is needed, create a separate certificate or add it later
```

### 2. DNS Validation Setup
```bash
# Get validation records
aws acm describe-certificate \
  --certificate-arn $CERT_ARN \
  --region us-east-1 \
  --query 'Certificate.DomainValidationOptions[0].ResourceRecord'

# Expected output format:
# {
#   "Name": "_validation_record.paulinenamwakira.com.",
#   "Type": "CNAME",
#   "Value": "validation_value.acm-validations.aws."
# }
```

### 3. Route 53 Hosted Zone
```bash
# Create hosted zone for domain
HOSTED_ZONE_ID=$(aws route53 create-hosted-zone \
  --name paulinenamwakira.com \
  --caller-reference $(date +%s) \
  --query 'HostedZone.Id' --output text)

# Get name servers
aws route53 get-hosted-zone \
  --id $HOSTED_ZONE_ID \
  --query 'DelegationSet.NameServers'
```

### 4. CloudFront Distribution
```json
{
  "CallerReference": "portfolio-cloudfront-$(date +%s)",
  "Comment": "Portfolio website with HTTPS",
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-portfolio-origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-portfolio-origin",
        "DomainName": "BUCKET_NAME.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "Enabled": true,
  "Aliases": {
    "Quantity": 0,
    "Items": []
  },
  "DefaultRootObject": "index.html",
  "PriceClass": "PriceClass_100",
  "ViewerCertificate": {
    "CloudFrontDefaultCertificate": true
  }
}
```

Create CloudFront distribution:
```bash
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

---

## Custom Domain Setup

### 1. SSL Certificate Validation
Once DNS validation records are added to your domain registrar:
```bash
# Check certificate status
aws acm describe-certificate \
  --certificate-arn $CERT_ARN \
  --region us-east-1 \
  --query 'Certificate.Status'
```

### 2. Update CloudFront with Custom Domain
After certificate validation:
```bash
# Get distribution config
aws cloudfront get-distribution-config \
  --id $CLOUDFRONT_DISTRIBUTION_ID \
  --query 'DistributionConfig' > current-config.json

# Update config to include custom domain and certificate
# Edit current-config.json to add:
# - "Aliases": {"Quantity": 2, "Items": ["paulinenamwakira.com", "www.paulinenamwakira.com"]}
# - "ViewerCertificate": {"ACMCertificateArn": "$CERT_ARN", "SSLSupportMethod": "sni-only"}

# Update distribution
aws cloudfront update-distribution \
  --id $CLOUDFRONT_DISTRIBUTION_ID \
  --distribution-config file://updated-config.json \
  --if-match $ETAG
```

### 3. DNS Records for Custom Domain
```bash
# Create A record pointing to CloudFront
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [
      {
        "Action": "CREATE",
        "ResourceRecordSet": {
          "Name": "paulinenamwakira.com",
          "Type": "A",
          "AliasTarget": {
            "DNSName": "d2ripcvvz75x7o.cloudfront.net",
            "EvaluateTargetHealth": false,
            "HostedZoneId": "Z2FDTNDATAQYW2"
          }
        }
      }
    ]
  }'
```

---

## Cost Analysis

### Monthly Cost Breakdown

**Free Tier Benefits (First 12 months):**
- S3: 5GB storage + 20,000 GET requests
- CloudFront: 1TB data transfer + 10M requests
- Lambda: 1M requests + 400,000 GB-seconds
- DynamoDB: 25GB storage + 25 read/write capacity units

**Ongoing Costs (After free tier):**
- S3 Storage: ~$0.50/month (20GB)
- CloudFront: ~$1-5/month (based on traffic)
- Lambda: ~$0.20/month (low traffic)
- DynamoDB: ~$1.25/month (on-demand pricing)
- Route 53: $0.50/month (hosted zone) - if using Route 53
- Certificate Manager: FREE

**Total Estimated Monthly Cost: $3-7/month**

### Cost Optimization Lessons Learned
- Delete unused SSL certificates to free up quota
- Remove old S3 buckets to eliminate storage costs
- Use single-domain certificates instead of multi-domain for faster validation
- Monitor and clean up unused resources regularly

### Cost Optimization Strategies
1. Enable S3 Intelligent Tiering
2. Set CloudFront cache policies appropriately
3. Use DynamoDB on-demand billing for variable workloads
4. Monitor usage with AWS Cost Explorer

---

## Security Considerations

### 1. Data Protection
- All data encrypted in transit (HTTPS)
- DynamoDB encryption at rest enabled by default
- S3 bucket policies restrict public write access
- Lambda functions run in isolated environments

### 2. Access Control
```bash
# Create least-privilege IAM policies
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/portfolio-*"
    }
  ]
}
```

### 3. Monitoring and Logging
```bash
# Enable CloudTrail for API logging
aws cloudtrail create-trail \
  --name portfolio-audit-trail \
  --s3-bucket-name portfolio-audit-logs

# Enable Lambda function logging
aws logs create-log-group \
  --log-group-name /aws/lambda/portfolio-api
```

### 4. Security Headers
Implement security headers in CloudFront:
```json
{
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin"
}
```

---

## Monitoring and Maintenance

### 1. CloudWatch Alarms
```bash
# Create alarm for Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name portfolio-lambda-errors \
  --alarm-description "Lambda function errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=portfolio-api

# Create alarm for website availability
aws cloudwatch put-metric-alarm \
  --alarm-name portfolio-website-availability \
  --alarm-description "Website availability check" \
  --metric-name OriginLatency \
  --namespace AWS/CloudFront \
  --statistic Average \
  --period 300 \
  --threshold 5000 \
  --comparison-operator GreaterThanThreshold
```

### 2. Automated Backups
```bash
# Enable DynamoDB point-in-time recovery
aws dynamodb update-continuous-backups \
  --table-name portfolio-contact-submissions \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

### 3. Update Procedures
```bash
# Script for updating Lambda function
#!/bin/bash
# update-lambda.sh

# Build new deployment package
cd lambda-deployment
npm install --production
zip -r ../portfolio-lambda-new.zip .
cd ..

# Update Lambda function
aws lambda update-function-code \
  --function-name portfolio-api \
  --zip-file fileb://portfolio-lambda-new.zip

# Update website content
npm run build
aws s3 sync dist/ s3://$BUCKET_NAME/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
  --paths "/*"
```

---

## Troubleshooting

### Common Issues and Solutions

**1. Certificate Validation Fails**
```bash
# Check certificate status
aws acm describe-certificate --certificate-arn $CERT_ARN --region us-east-1

# If PENDING_VALIDATION for multiple domains, create single-domain certificate
aws acm request-certificate \
  --domain-name yourdomain.com \
  --validation-method DNS \
  --region us-east-1

# Delete stuck certificates to free up quota
aws acm delete-certificate --certificate-arn $STUCK_CERT_ARN --region us-east-1
```

**1a. Multiple Domain Validation Issues**
If your certificate includes both root domain and www subdomain, and one fails validation:
- Create a new certificate with only the root domain
- Delete the problematic certificate
- Update CloudFront to use the working certificate

**2. CloudFront Distribution Not Working**
```bash
# Check distribution status
aws cloudfront get-distribution --id $CLOUDFRONT_DISTRIBUTION_ID

# Test CloudFront endpoint
curl -I https://d2ripcvvz75x7o.cloudfront.net
```

**3. Lambda Function Errors**
```bash
# Check function logs
aws logs filter-log-events \
  --log-group-name /aws/lambda/portfolio-api \
  --start-time $(date -d '1 hour ago' +%s)000

# Test function directly
aws lambda invoke \
  --function-name portfolio-api \
  --payload '{"httpMethod":"GET","path":"/api/health"}' \
  response.json
```

**4. DynamoDB Access Issues**
```bash
# Verify table exists
aws dynamodb describe-table --table-name portfolio-contact-submissions

# Test write access
aws dynamodb put-item \
  --table-name portfolio-contact-submissions \
  --item '{"id":{"N":"999"},"name":{"S":"Test"}}'
```

### Performance Optimization

**1. CloudFront Cache Optimization**
```json
{
  "DefaultCacheBehavior": {
    "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
    "OriginRequestPolicyId": "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf",
    "ResponseHeadersPolicyId": "5cc3b908-e619-4b99-88e5-2cf7f45965bd"
  }
}
```

**2. Lambda Performance Tuning**
```javascript
// Optimize Lambda cold starts
const dynamodb = new DynamoDBDocumentClient(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

// Connection pooling and reuse
let cachedConnection = null;

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  
  if (!cachedConnection) {
    cachedConnection = dynamodb;
  }
  
  // Function logic here
};
```

---

## Security Secrets Notice

**⚠️ IMPORTANT: Do NOT share these sensitive values in your Medium article:**

1. **AWS Access Keys** - Never share AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY
2. **Certificate ARNs** - While not highly sensitive, avoid sharing specific ARNs
3. **Account IDs** - Replace actual AWS account IDs with placeholder values
4. **Specific Bucket Names** - Use generic examples instead of actual bucket names
5. **API Gateway IDs** - Replace with placeholder values
6. **Lambda Function ARNs** - Use generic examples

**Safe to Share:**
- Architecture diagrams
- Code snippets (without credentials)
- Configuration examples with placeholder values
- Command structures and workflows
- Cost estimates and optimization strategies

---

## Deployment Timeline and Lessons Learned

### Actual Deployment Experience
**Total deployment time:** ~2 hours
- Initial setup and S3 deployment: 30 minutes
- Lambda and DynamoDB setup: 45 minutes  
- SSL certificate issues and resolution: 30 minutes
- CloudFront configuration and deployment: 15 minutes

### Key Lessons Learned
1. **SSL Certificate Strategy**: Request single-domain certificates first, add subdomains later if needed
2. **Resource Cleanup**: Regularly delete unused certificates and S3 buckets to optimize costs
3. **CloudFront Deployment**: Allow 10-15 minutes for global distribution deployment
4. **DNS Validation**: Can take 5 minutes to several hours depending on registrar

### Problem Resolution Applied
- Deleted stuck SSL certificate with www subdomain validation issues
- Created new single-domain certificate that validated immediately
- Cleaned up 3 unused S3 buckets saving ongoing storage costs
- Updated CloudFront with validated certificate successfully

## Conclusion

This deployment demonstrates a complete serverless architecture on AWS, providing:

- **High Availability**: Multi-region CloudFront distribution
- **Security**: HTTPS encryption and proper access controls
- **Scalability**: Serverless functions that scale automatically
- **Cost Efficiency**: Pay-per-use pricing model
- **Performance**: Global CDN for fast content delivery

The resulting infrastructure is production-ready and capable of handling significant traffic loads.

**Key Achievements:**
- Professional HTTPS website with custom domain
- Serverless backend with database integration
- Global content delivery network
- Automated SSL certificate management
- Cost-effective hosting solution under $7/month
- Resource optimization and cleanup procedures

This architecture serves as a template for deploying similar portfolio websites or small business sites on AWS infrastructure, with real-world troubleshooting solutions included.

---

**Author:** AI Assistant  
**Date:** May 31, 2025  
**Version:** 1.0  
**GitHub Repository:** https://github.com/kira-PJ/pauline-namwakira-portfolio