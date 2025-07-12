/**
 * Project Configuration
 * Defines the project structure and settings
 */

export const config = {
    // Project metadata
    name: 'cscart-mcp-server',
    version: '0.1.0',
    description: 'Model Context Protocol server for CS-Cart e-commerce platform',
    
    // Directory structure
    directories: {
      src: 'src',
      tests: 'tests',
      docs: 'docs',
      logs: 'logs',
      config: 'config'
    },
    
    // Main entry points
    entry: {
      main: 'src/index.js',
      test: 'tests/index.test.js'
    },
    
    // Environment configuration
    environment: {
      required: [
        'CSCART_API_URL',
        'CSCART_API_EMAIL',
        'CSCART_API_KEY'
      ],
      optional: [
        'LOG_LEVEL',
        'NODE_ENV'
      ]
    },
    
    // Docker configuration
    docker: {
      baseImage: 'node:18-alpine',
      workdir: '/app',
      user: 'mcp',
      userId: 1001,
      groupId: 1001,
      ports: {
        http: 3000
      }
    },
    
    // CS-Cart API configuration
    cscart: {
      endpoints: {
        products: '/products',
        orders: '/orders',
        categories: '/categories',
        users: '/users',
        statistics: '/statistics'
      },
      statusCodes: {
        product: {
          active: 'A',
          disabled: 'D',
          hidden: 'H'
        },
        order: {
          open: 'O',
          processed: 'P',
          complete: 'C',
          failed: 'F',
          declined: 'D',
          backordered: 'B',
          incomplete: 'I'
        },
        user: {
          active: 'A',
          disabled: 'D'
        }
      }
    }
  };