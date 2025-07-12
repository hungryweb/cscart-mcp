# CS-Cart MCP Server

A Model Context Protocol (MCP) server that provides comprehensive tools for managing CS-Cart e-commerce stores, including product management, order handling, and sales analytics.

## Features

### Product Management
- **get_products**: Retrieve product listings with filtering and pagination
- **get_product**: Get detailed product information
- **create_product**: Add new products to the store
- **update_product**: Modify existing product details
- **delete_product**: Remove products from the store
- **update_product_stock**: Update product inventory levels

### Order Management
- **get_orders**: Retrieve order listings with various filters
- **get_order**: Get detailed order information
- **update_order_status**: Change order status and notify customers

### Category Management
- **get_categories**: Retrieve product categories and subcategories

### User Management
- **get_users**: Get customer and user information

### Analytics
- **get_sales_statistics**: Retrieve sales data and statistics

## Installation

### Option 1: Quick Setup (Recommended)

1. Clone this repository:
```bash
git clone <repository-url>
cd cscart-mcp-server
```

2. Run the setup script:
```bash
npm run setup
```

3. Install dependencies:
```bash
npm install
```

4. Update `.env` with your CS-Cart credentials and start:
```bash
npm start
```

### Option 2: Manual Local Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd cscart-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your CS-Cart API credentials:
```bash
CSCART_API_URL=https://your-store.com/api
CSCART_API_EMAIL=admin@yourstore.com
CSCART_API_KEY=your-api-key-here
```

### Option 2: Docker Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd cscart-mcp-server
```

2. Configure environment variables:
```bash
cp .env.example .env
```

3. Build and run with Docker Compose:
```bash
docker-compose up -d
```

Or build and run with Docker:
```bash
# Build the image
docker build -t cscart-mcp-server .

# Run the container
docker run -d \
  --name cscart-mcp-server \
  --env-file .env \
  cscart-mcp-server
```

### Option 3: Production Docker Build

For production deployment with optimized image:
```bash
# Build production image
docker build -f Dockerfile.production -t cscart-mcp-server:prod .

# Run production container
docker run -d \
  --name cscart-mcp-server-prod \
  --env-file .env \
  --restart unless-stopped \
  cscart-mcp-server:prod
```

## CS-Cart API Setup

1. **Enable API Access**:
   - Log into your CS-Cart admin panel
   - Go to **Administration → API access**
   - Enable API access for your store

2. **Generate API Key**:
   - Create a new API key or use existing one
   - Note the API key and admin email for configuration

3. **API Permissions**:
   - Ensure the API user has appropriate permissions for:
     - Products (read/write)
     - Orders (read/write)
     - Categories (read)
     - Users (read)
     - Statistics (read)

## Usage

### Running the Server

#### Quick Commands
```bash
# Setup project
npm run setup

# Development
npm run dev

# Production
npm start

# Docker commands
npm run docker:build      # Build standard image
npm run docker:build:prod # Build production image
npm run docker:run        # Start with docker-compose
npm run docker:stop       # Stop docker-compose
npm run docker:logs       # View logs
```

#### Docker Deployment
Start with Docker Compose:
```bash
docker-compose up -d
```

View logs:
```bash
docker-compose logs -f cscart-mcp-server
```

Stop the service:
```bash
docker-compose down
```

#### Production Deployment
For production use the optimized Dockerfile:
```bash
docker build -f Dockerfile.production -t cscart-mcp-server:latest .
docker run -d \
  --name cscart-mcp-prod \
  --env-file .env \
  --restart unless-stopped \
  --memory=512m \
  --cpus=0.5 \
  cscart-mcp-server:latest
```

### Integration with MCP Clients

Add this server to your MCP client configuration. For example, with Claude Desktop:

```json
{
  "mcpServers": {
    "cscart": {
      "command": "node",
      "args": ["/path/to/cscart-mcp-server/src/index.js"],
      "env": {
        "CSCART_API_URL": "https://your-store.com/api",
        "CSCART_API_EMAIL": "admin@yourstore.com",
        "CSCART_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Available Tools

### Product Tools

#### get_products
Retrieve a list of products with optional filtering:
```json
{
  "page": 1,
  "items_per_page": 10,
  "status": "A",
  "category_id": 123,
  "q": "search term"
}
```

#### create_product
Create a new product:
```json
{
  "product": "Product Name",
  "price": 29.99,
  "category_ids": [123, 456],
  "description": "Short description",
  "full_description": "Full product description",
  "status": "A",
  "amount": 100
}
```

### Order Tools

#### get_orders
Retrieve orders with filtering:
```json
{
  "page": 1,
  "items_per_page": 10,
  "status": "P",
  "period": "M",
  "user_id": 123
}
```

#### update_order_status
Update order status:
```json
{
  "order_id": 12345,
  "status": "C",
  "notify_user": true
}
```

### Status Codes

**Product Status:**
- `A` - Active
- `D` - Disabled
- `H` - Hidden

**Order Status:**
- `O` - Open
- `P` - Processed
- `C` - Complete
- `F` - Failed
- `D` - Declined
- `B` - Backordered
- `I` - Incomplete

**User Status:**
- `A` - Active
- `D` - Disabled

**User Types:**
- `A` - Admin
- `V` - Vendor
- `C` - Customer

## Error Handling

The server includes comprehensive error handling:
- API connection errors
- Invalid parameters
- Missing required fields
- CS-Cart API errors

All errors are returned with descriptive messages to help with debugging.

## Docker Configuration

### Environment Variables
When using Docker, you can set environment variables in several ways:

1. **Using .env file** (recommended):
```bash
CSCART_API_URL=https://your-store.com/api
CSCART_API_EMAIL=admin@yourstore.com
CSCART_API_KEY=your-api-key-here
LOG_LEVEL=info
```

2. **Using docker-compose.yml**:
```yaml
environment:
  - CSCART_API_URL=https://your-store.com/api
  - CSCART_API_EMAIL=admin@yourstore.com
  - CSCART_API_KEY=your-api-key-here
```

3. **Using Docker run command**:
```bash
docker run -d \
  -e CSCART_API_URL=https://your-store.com/api \
  -e CSCART_API_EMAIL=admin@yourstore.com \
  -e CSCART_API_KEY=your-api-key-here \
  cscart-mcp-server
```

### Docker Images
- **Dockerfile**: Standard development image (~200MB)
- **Dockerfile.production**: Optimized production image (~150MB)
  - Multi-stage build for smaller size
  - Non-root user for security
  - Proper signal handling with dumb-init
  - Health checks included

### Resource Limits
The docker-compose.yml includes resource limits:
- CPU: 0.5 cores max, 0.25 cores reserved
- Memory: 512MB max, 256MB reserved

Adjust these based on your server capacity and usage requirements.

### Project Structure
```
cscart-mcp-server/
├── src/
│   └── index.js              # Main server file (moved here)
├── scripts/
│   └── setup.js              # Setup automation script
├── logs/                     # Log files directory
├── tests/                    # Test files directory
├── config/                   # Configuration files
├── package.json              # Updated paths
├── project.config.js         # Project configuration
├── Dockerfile               # Updated for new structure
├── Dockerfile.production    # Updated for new structure
├── docker-compose.yml       # Docker orchestration
├── .env.example             # Environment template
└── README.md                # Updated documentation
```

### Adding New Tools

To add new tools, extend the `ListToolsRequestSchema` handler and add corresponding methods to the `CSCartMCPServer` class.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues related to:
- **CS-Cart API**: Check CS-Cart documentation or support
- **MCP Protocol**: Refer to MCP documentation
- **This Server**: Open an issue in this repository

## Changelog

### v0.1.0
- Initial release
- Basic product management tools
- Order management functionality
- Category and user tools
- Sales statistics support