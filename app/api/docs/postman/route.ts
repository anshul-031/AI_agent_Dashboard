import { NextRequest, NextResponse } from 'next/server';
import { swaggerSpec } from '@/lib/swagger';

/**
 * @swagger
 * /api/docs/postman:
 *   get:
 *     summary: Generate and download live Postman collection from OpenAPI specification
 *     description: Dynamically generates a Postman collection with all endpoints, authentication, and example requests
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: Postman collection JSON file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 info:
 *                   type: object
 *                 item:
 *                   type: array
 *                 auth:
 *                   type: object
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const postmanCollection = generatePostmanCollection(swaggerSpec);
    
    return new NextResponse(JSON.stringify(postmanCollection, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="ai-agent-dashboard-api.postman_collection.json"',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error generating Postman collection:', error);
    return NextResponse.json(
      { error: 'Failed to generate Postman collection' },
      { status: 500 }
    );
  }
}

function generatePostmanCollection(swaggerSpec: any) {
  const collection: any = {
    info: {
      name: swaggerSpec.info?.title || 'AI Agent Dashboard API',
      description: swaggerSpec.info?.description || 'RESTful API for managing AI agents, executions, and workflows',
      version: swaggerSpec.info?.version || '1.0.0',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    auth: {
      type: 'bearer',
      bearer: [
        {
          key: 'token',
          value: '{{jwt_token}}',
          type: 'string',
        },
      ],
    },
    variable: [
      {
        key: 'baseUrl',
        value: swaggerSpec.servers?.[0]?.url || 'http://localhost:3000',
        type: 'string',
      },
      {
        key: 'jwt_token',
        value: '',
        type: 'string',
      },
    ],
    item: [],
  };

  const baseUrl = swaggerSpec.servers?.[0]?.url || 'http://localhost:3000';
  
  // Group endpoints by tags
  const groupedItems: Record<string, any[]> = {};

  if (swaggerSpec.paths) {
    Object.entries(swaggerSpec.paths).forEach(([path, pathItem]: [string, any]) => {
      Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
        if (typeof operation === 'object' && operation.summary) {
          const tags = operation.tags || ['Default'];
          const tag = tags[0];

          if (!groupedItems[tag]) {
            groupedItems[tag] = [];
          }

          const postmanRequest: any = {
            name: operation.summary || `${method.toUpperCase()} ${path}`,
            request: {
              method: method.toUpperCase(),
              header: [
                {
                  key: 'Content-Type',
                  value: 'application/json',
                  type: 'text',
                },
              ],
              url: {
                raw: `{{baseUrl}}${path}`,
                host: ['{{baseUrl}}'],
                path: path.split('/').filter(Boolean),
              },
              description: operation.description || operation.summary || '',
            },
            response: [],
          };

          // Add request body if present
          if (operation.requestBody?.content?.['application/json']?.schema) {
            const schema = operation.requestBody.content['application/json'].schema;
            postmanRequest.request.body = {
              mode: 'raw',
              raw: JSON.stringify(generateExampleFromSchema(schema), null, 2),
              options: {
                raw: {
                  language: 'json',
                },
              },
            };
          }

          // Add query parameters if present
          if (operation.parameters) {
            const queryParams = operation.parameters
              .filter((param: any) => param.in === 'query')
              .map((param: any) => ({
                key: param.name,
                value: param.example || '',
                description: param.description || '',
                disabled: !param.required,
              }));

            if (queryParams.length > 0) {
              postmanRequest.request.url.query = queryParams;
            }
          }

          groupedItems[tag].push(postmanRequest);
        }
      });
    });
  }

  // Convert grouped items to Postman folders
  collection.item = Object.entries(groupedItems).map(([tag, items]) => ({
    name: tag,
    description: `${tag} related endpoints`,
    item: items,
  }));

  return collection;
}

function generateExampleFromSchema(schema: any): any {
  if (!schema) return {};

  if (schema.example) {
    return schema.example;
  }

  if (schema.type === 'object' && schema.properties) {
    const example: any = {};
    Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
      if (prop.example !== undefined) {
        example[key] = prop.example;
      } else if (prop.type === 'string') {
        example[key] = prop.format === 'email' ? 'user@example.com' : 'string';
      } else if (prop.type === 'number' || prop.type === 'integer') {
        example[key] = 0;
      } else if (prop.type === 'boolean') {
        example[key] = true;
      } else if (prop.type === 'array') {
        example[key] = [];
      } else if (prop.type === 'object') {
        example[key] = generateExampleFromSchema(prop);
      }
    });
    return example;
  }

  if (schema.type === 'array' && schema.items) {
    return [generateExampleFromSchema(schema.items)];
  }

  switch (schema.type) {
    case 'string':
      return schema.format === 'email' ? 'user@example.com' : 'string';
    case 'number':
    case 'integer':
      return 0;
    case 'boolean':
      return true;
    default:
      return {};
  }
}
