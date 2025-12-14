#!/usr/bin/env node

/**
 * Financial Modeling Prep MCP Server
 * 
 * Stdio-based Model Context Protocol server for Financial Modeling Prep API.
 * Provides real-time financial data, stock quotes, company fundamentals, and market insights.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

const FMP_API_KEY = process.env.FMP_API_KEY;
const FMP_BASE_URL = 'https://financialmodelingprep.com/stable';

if (!FMP_API_KEY) {
  console.error('Error: FMP_API_KEY environment variable is required');
  process.exit(1);
}

/**
 * Helper function to make FMP API requests
 */
async function fetchFMP(endpoint: string): Promise<any> {
  const url = `${FMP_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${FMP_API_KEY}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`FMP API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Define available tools
 */
const TOOLS: Tool[] = [
  {
    name: 'get_quote',
    description: 'Get real-time stock quote for a symbol (e.g., AAPL, TSLA, MSFT)',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock ticker symbol (e.g., AAPL)',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'search_symbol',
    description: 'Search for stock symbols by company name or ticker',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (company name or ticker)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_company_profile',
    description: 'Get detailed company profile information including description, industry, sector, CEO, and more',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock ticker symbol',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_income_statement',
    description: 'Get company income statement (annual or quarterly)',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock ticker symbol',
        },
        period: {
          type: 'string',
          description: 'Period type (annual or quarter)',
          enum: ['annual', 'quarter'],
        },
        limit: {
          type: 'number',
          description: 'Number of periods to return (default: 5)',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_balance_sheet',
    description: 'Get company balance sheet statement (annual or quarterly)',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock ticker symbol',
        },
        period: {
          type: 'string',
          description: 'Period type (annual or quarter)',
          enum: ['annual', 'quarter'],
        },
        limit: {
          type: 'number',
          description: 'Number of periods to return (default: 5)',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_cash_flow',
    description: 'Get company cash flow statement (annual or quarterly)',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock ticker symbol',
        },
        period: {
          type: 'string',
          description: 'Period type (annual or quarter)',
          enum: ['annual', 'quarter'],
        },
        limit: {
          type: 'number',
          description: 'Number of periods to return (default: 5)',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_stock_news',
    description: 'Get latest news articles for a stock symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock ticker symbol',
        },
        limit: {
          type: 'number',
          description: 'Number of articles to return (default: 10)',
        },
      },
      required: ['symbol'],
    },
  },
];

/**
 * Create and configure the MCP server
 */
const server = new Server(
  {
    name: 'fmp-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handler for listing available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

/**
 * Handler for tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_quote': {
        const { symbol } = args as { symbol: string };
        const data = await fetchFMP(`/quote?symbol=${symbol.toUpperCase()}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'search_symbol': {
        const { query } = args as { query: string };
        const data = await fetchFMP(`/search-symbol?query=${encodeURIComponent(query)}&limit=10`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_company_profile': {
        const { symbol } = args as { symbol: string };
        const data = await fetchFMP(`/profile?symbol=${symbol.toUpperCase()}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_income_statement': {
        const { symbol, period = 'annual', limit = 5 } = args as { 
          symbol: string; 
          period?: string; 
          limit?: number;
        };
        const data = await fetchFMP(`/income-statement?symbol=${symbol.toUpperCase()}&period=${period}&limit=${limit}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_balance_sheet': {
        const { symbol, period = 'annual', limit = 5 } = args as { 
          symbol: string; 
          period?: string; 
          limit?: number;
        };
        const data = await fetchFMP(`/balance-sheet-statement?symbol=${symbol.toUpperCase()}&period=${period}&limit=${limit}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_cash_flow': {
        const { symbol, period = 'annual', limit = 5 } = args as { 
          symbol: string; 
          period?: string; 
          limit?: number;
        };
        const data = await fetchFMP(`/cash-flow-statement?symbol=${symbol.toUpperCase()}&period=${period}&limit=${limit}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_stock_news': {
        const { symbol, limit = 10 } = args as { symbol: string; limit?: number };
        const data = await fetchFMP(`/news/stock?symbols=${symbol.toUpperCase()}&limit=${limit}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Log to stderr so it doesn't interfere with stdio protocol
  console.error('FMP MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
