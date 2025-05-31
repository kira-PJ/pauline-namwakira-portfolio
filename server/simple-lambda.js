const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-west-2",
});
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event, context) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };

  // Handle preflight OPTIONS requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const path = event.path;
  const method = event.httpMethod;

  try {
    // Health check endpoint
    if (path === '/health' && method === 'GET') {
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString()
        })
      };
    }

    // Contact form submission
    if (path === '/api/contact' && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      
      // Create contact submission record
      const submission = {
        id: Date.now(),
        name: body.name,
        email: body.email,
        subject: body.subject,
        message: body.message,
        createdAt: new Date().toISOString()
      };

      // Save to DynamoDB
      await dynamodb.send(new PutCommand({
        TableName: process.env.CONTACTS_TABLE || 'portfolio-contacts',
        Item: submission
      }));

      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Contact form submitted successfully',
          id: submission.id
        })
      };
    }

    // Default 404 response
    return {
      statusCode: 404,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Not Found'
      })
    };

  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Internal server error',
        error: error.message
      })
    };
  }
};