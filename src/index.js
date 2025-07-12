#!/usr/bin/env node

/**
 * CS-Cart MCP Server
 * Provides tools to manage CS-Cart store products and access order data
 * 
 * @file src/index.js
 * @version 0.1.0
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

class CSCartMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'cscart-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // Product Management Tools
          {
            name: 'get_products',
            description: 'Retrieve a list of products from the CS-Cart store',
            inputSchema: {
              type: 'object',
              properties: {
                page: {
                  type: 'number',
                  description: 'Page number for pagination',
                  default: 1,
                },
                items_per_page: {
                  type: 'number',
                  description: 'Number of items per page',
                  default: 10,
                },
                status: {
                  type: 'string',
                  description: 'Product status filter (A=Active, D=Disabled, H=Hidden)',
                  enum: ['A', 'D', 'H'],
                },
                category_id: {
                  type: 'number',
                  description: 'Filter by category ID',
                },
                q: {
                  type: 'string',
                  description: 'Search query for product name',
                },
              },
            },
          },
          {
            name: 'get_product',
            description: 'Get detailed information about a specific product',
            inputSchema: {
              type: 'object',
              properties: {
                product_id: {
                  type: 'number',
                  description: 'Product ID',
                },
              },
              required: ['product_id'],
            },
          },
          {
            name: 'create_product',
            description: 'Create a new product in the CS-Cart store',
            inputSchema: {
              type: 'object',
              properties: {
                product: {
                  type: 'string',
                  description: 'Product name',
                },
                price: {
                  type: 'number',
                  description: 'Product price',
                },
                category_ids: {
                  type: 'array',
                  items: { type: 'number' },
                  description: 'Array of category IDs',
                },
                description: {
                  type: 'string',
                  description: 'Product description',
                },
                full_description: {
                  type: 'string',
                  description: 'Full product description',
                },
                status: {
                  type: 'string',
                  description: 'Product status (A=Active, D=Disabled, H=Hidden)',
                  enum: ['A', 'D', 'H'],
                  default: 'A',
                },
                amount: {
                  type: 'number',
                  description: 'Product quantity in stock',
                  default: 0,
                },
                weight: {
                  type: 'number',
                  description: 'Product weight',
                },
                shipping_freight: {
                  type: 'number',
                  description: 'Shipping cost',
                },
              },
              required: ['product', 'price'],
            },
          },
          {
            name: 'update_product',
            description: 'Update an existing product',
            inputSchema: {
              type: 'object',
              properties: {
                product_id: {
                  type: 'number',
                  description: 'Product ID to update',
                },
                product: {
                  type: 'string',
                  description: 'Product name',
                },
                price: {
                  type: 'number',
                  description: 'Product price',
                },
                category_ids: {
                  type: 'array',
                  items: { type: 'number' },
                  description: 'Array of category IDs',
                },
                description: {
                  type: 'string',
                  description: 'Product description',
                },
                full_description: {
                  type: 'string',
                  description: 'Full product description',
                },
                status: {
                  type: 'string',
                  description: 'Product status (A=Active, D=Disabled, H=Hidden)',
                  enum: ['A', 'D', 'H'],
                },
                amount: {
                  type: 'number',
                  description: 'Product quantity in stock',
                },
                weight: {
                  type: 'number',
                  description: 'Product weight',
                },
                shipping_freight: {
                  type: 'number',
                  description: 'Shipping cost',
                },
              },
              required: ['product_id'],
            },
          },
          {
            name: 'delete_product',
            description: 'Delete a product from the store',
            inputSchema: {
              type: 'object',
              properties: {
                product_id: {
                  type: 'number',
                  description: 'Product ID to delete',
                },
              },
              required: ['product_id'],
            },
          },
          {
            name: 'update_product_stock',
            description: 'Update product stock quantity',
            inputSchema: {
              type: 'object',
              properties: {
                product_id: {
                  type: 'number',
                  description: 'Product ID',
                },
                amount: {
                  type: 'number',
                  description: 'New stock quantity',
                },
              },
              required: ['product_id', 'amount'],
            },
          },
          
          // Category Management Tools
          {
            name: 'get_categories',
            description: 'Get list of product categories',
            inputSchema: {
              type: 'object',
              properties: {
                parent_id: {
                  type: 'number',
                  description: 'Parent category ID (0 for root categories)',
                  default: 0,
                },
                status: {
                  type: 'string',
                  description: 'Category status filter (A=Active, D=Disabled, H=Hidden)',
                  enum: ['A', 'D', 'H'],
                },
              },
            },
          },
          
          // Order Management Tools
          {
            name: 'get_orders',
            description: 'Retrieve orders from the CS-Cart store',
            inputSchema: {
              type: 'object',
              properties: {
                page: {
                  type: 'number',
                  description: 'Page number for pagination',
                  default: 1,
                },
                items_per_page: {
                  type: 'number',
                  description: 'Number of items per page',
                  default: 10,
                },
                status: {
                  type: 'string',
                  description: 'Order status filter (O=Open, P=Processed, C=Complete, F=Failed, D=Declined, B=Backordered, I=Incomplete)',
                  enum: ['O', 'P', 'C', 'F', 'D', 'B', 'I'],
                },
                period: {
                  type: 'string',
                  description: 'Time period filter (A=All time, D=Today, W=This week, M=This month, Y=This year)',
                  enum: ['A', 'D', 'W', 'M', 'Y'],
                },
                time_from: {
                  type: 'string',
                  description: 'Start date for custom period (YYYY-MM-DD)',
                },
                time_to: {
                  type: 'string',
                  description: 'End date for custom period (YYYY-MM-DD)',
                },
                user_id: {
                  type: 'number',
                  description: 'Filter by user ID',
                },
              },
            },
          },
          {
            name: 'get_order',
            description: 'Get detailed information about a specific order',
            inputSchema: {
              type: 'object',
              properties: {
                order_id: {
                  type: 'number',
                  description: 'Order ID',
                },
              },
              required: ['order_id'],
            },
          },
          {
            name: 'update_order_status',
            description: 'Update order status',
            inputSchema: {
              type: 'object',
              properties: {
                order_id: {
                  type: 'number',
                  description: 'Order ID',
                },
                status: {
                  type: 'string',
                  description: 'New order status (O=Open, P=Processed, C=Complete, F=Failed, D=Declined, B=Backordered, I=Incomplete)',
                  enum: ['O', 'P', 'C', 'F', 'D', 'B', 'I'],
                },
                notify_user: {
                  type: 'boolean',
                  description: 'Whether to notify the user about status change',
                  default: true,
                },
              },
              required: ['order_id', 'status'],
            },
          },
          
          // User Management Tools
          {
            name: 'get_users',
            description: 'Get list of users/customers',
            inputSchema: {
              type: 'object',
              properties: {
                page: {
                  type: 'number',
                  description: 'Page number for pagination',
                  default: 1,
                },
                items_per_page: {
                  type: 'number',
                  description: 'Number of items per page',
                  default: 10,
                },
                status: {
                  type: 'string',
                  description: 'User status filter (A=Active, D=Disabled)',
                  enum: ['A', 'D'],
                },
                user_type: {
                  type: 'string',
                  description: 'User type filter (A=Admin, V=Vendor, C=Customer)',
                  enum: ['A', 'V', 'C'],
                },
              },
            },
          },
          
          // Statistics Tools
          {
            name: 'get_sales_statistics',
            description: 'Get sales statistics for a specific period',
            inputSchema: {
              type: 'object',
              properties: {
                period: {
                  type: 'string',
                  description: 'Time period (D=Today, W=This week, M=This month, Y=This year)',
                  enum: ['D', 'W', 'M', 'Y'],
                  default: 'M',
                },
                time_from: {
                  type: 'string',
                  description: 'Start date for custom period (YYYY-MM-DD)',
                },
                time_to: {
                  type: 'string',
                  description: 'End date for custom period (YYYY-MM-DD)',
                },
              },
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_products':
            return await this.getProducts(args);
          case 'get_product':
            return await this.getProduct(args);
          case 'create_product':
            return await this.createProduct(args);
          case 'update_product':
            return await this.updateProduct(args);
          case 'delete_product':
            return await this.deleteProduct(args);
          case 'update_product_stock':
            return await this.updateProductStock(args);
          case 'get_categories':
            return await this.getCategories(args);
          case 'get_orders':
            return await this.getOrders(args);
          case 'get_order':
            return await this.getOrder(args);
          case 'update_order_status':
            return await this.updateOrderStatus(args);
          case 'get_users':
            return await this.getUsers(args);
          case 'get_sales_statistics':
            return await this.getSalesStatistics(args);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        throw new McpError(ErrorCode.InternalError, `Error executing ${name}: ${error.message}`);
      }
    });
  }

  // Helper method to make API requests
  async makeRequest(method, endpoint, data = null) {
    const config = {
      method,
      url: `${process.env.CSCART_API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.CSCART_API_EMAIL}:${process.env.CSCART_API_KEY}`).toString('base64')}`,
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  }

  // Product Management Methods
  async getProducts(args) {
    const params = new URLSearchParams();
    
    if (args.page) params.append('page', args.page.toString());
    if (args.items_per_page) params.append('items_per_page', args.items_per_page.toString());
    if (args.status) params.append('status', args.status);
    if (args.category_id) params.append('cid', args.category_id.toString());
    if (args.q) params.append('q', args.q);

    const queryString = params.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    
    const result = await this.makeRequest('GET', endpoint);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }

  async getProduct(args) {
    const result = await this.makeRequest('GET', `/products/${args.product_id}`);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }

  async createProduct(args) {
    const result = await this.makeRequest('POST', '/products', args);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }

  async updateProduct(args) {
    const { product_id, ...productData } = args;
    const result = await this.makeRequest('PUT', `/products/${product_id}`, productData);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }

  async deleteProduct(args) {
    const result = await this.makeRequest('DELETE', `/products/${args.product_id}`);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }

  async updateProductStock(args) {
    const productData = { amount: args.amount };
    const result = await this.makeRequest('PUT', `/products/${args.product_id}`, productData);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }

  // Category Management Methods
  async getCategories(args) {
    const params = new URLSearchParams();
    
    if (args.parent_id !== undefined) params.append('parent_id', args.parent_id.toString());
    if (args.status) params.append('status', args.status);

    const queryString = params.toString();
    const endpoint = `/categories${queryString ? `?${queryString}` : ''}`;
    
    const result = await this.makeRequest('GET', endpoint);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }

  // Order Management Methods
  async getOrders(args) {
    const params = new URLSearchParams();
    
    if (args.page) params.append('page', args.page.toString());
    if (args.items_per_page) params.append('items_per_page', args.items_per_page.toString());
    if (args.status) params.append('status', args.status);
    if (args.period) params.append('period', args.period);
    if (args.time_from) params.append('time_from', args.time_from);
    if (args.time_to) params.append('time_to', args.time_to);
    if (args.user_id) params.append('user_id', args.user_id.toString());

    const queryString = params.toString();
    const endpoint = `/orders${queryString ? `?${queryString}` : ''}`;
    
    const result = await this.makeRequest('GET', endpoint);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }

  async getOrder(args) {
    const result = await this.makeRequest('GET', `/orders/${args.order_id}`);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }

  async updateOrderStatus(args) {
    const { order_id, ...orderData } = args;
    const result = await this.makeRequest('PUT', `/orders/${order_id}`, orderData);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }

  // User Management Methods
  async getUsers(args) {
    const params = new URLSearchParams();
    
    if (args.page) params.append('page', args.page.toString());
    if (args.items_per_page) params.append('items_per_page', args.items_per_page.toString());
    if (args.status) params.append('status', args.status);
    if (args.user_type) params.append('user_type', args.user_type);

    const queryString = params.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
    
    const result = await this.makeRequest('GET', endpoint);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }

  // Statistics Methods
  async getSalesStatistics(args) {
    const params = new URLSearchParams();
    
    if (args.period) params.append('period', args.period);
    if (args.time_from) params.append('time_from', args.time_from);
    if (args.time_to) params.append('time_to', args.time_to);

    const queryString = params.toString();
    const endpoint = `/statistics/sales${queryString ? `?${queryString}` : ''}`;
    
    const result = await this.makeRequest('GET', endpoint);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('CS-Cart MCP server running on stdio');
  }
}

const server = new CSCartMCPServer();
server.run().catch(console.error);