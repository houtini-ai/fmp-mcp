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
  {
    name: 'get_market_gainers',
    description: 'Get stocks with the largest price increases (top gainers)',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_market_losers',
    description: 'Get stocks with the largest price drops (top losers)',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_most_active',
    description: 'Get most actively traded stocks by volume',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_sector_performance',
    description: 'Get current sector performance snapshot',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format (optional, defaults to latest)',
        },
      },
    },
  },
  {
    name: 'get_analyst_estimates',
    description: 'Get analyst financial estimates for a stock (revenue, EPS forecasts)',
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
          description: 'Number of periods to return (default: 10)',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_price_target',
    description: 'Get analyst price target summary for a stock',
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
    name: 'get_analyst_ratings',
    description: 'Get analyst ratings and upgrades/downgrades for a stock',
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
    name: 'get_insider_trading',
    description: 'Get recent insider trading activity for a stock',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock ticker symbol',
        },
        limit: {
          type: 'number',
          description: 'Number of transactions to return (default: 100)',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_key_metrics',
    description: 'Get key financial metrics (P/E, ROE, debt ratios, etc.)',
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
    name: 'get_financial_ratios',
    description: 'Get detailed financial ratios (profitability, liquidity, efficiency)',
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
    name: 'get_earnings_calendar',
    description: 'Get upcoming earnings announcements calendar',
    inputSchema: {
      type: 'object',
      properties: {
        from: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format (optional)',
        },
        to: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format (optional)',
        },
      },
    },
  },
  {
    name: 'get_economic_calendar',
    description: 'Get upcoming economic data releases calendar',
    inputSchema: {
      type: 'object',
      properties: {
        from: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format (optional)',
        },
        to: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format (optional)',
        },
      },
    },
  },
  {
    name: 'get_economic_indicator',
    description: 'Get economic indicator data (GDP, unemployment, inflation, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Indicator name (e.g., GDP, unemploymentRate, CPI)',
        },
        from: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format (optional)',
        },
        to: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format (optional)',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'get_technical_indicator_rsi',
    description: 'Get Relative Strength Index (RSI) technical indicator',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock ticker symbol',
        },
        timeframe: {
          type: 'string',
          description: 'Timeframe (1min, 5min, 15min, 30min, 1hour, 4hour, 1day)',
          enum: ['1min', '5min', '15min', '30min', '1hour', '4hour', '1day'],
        },
        period: {
          type: 'number',
          description: 'Period length (default: 14)',
        },
      },
      required: ['symbol', 'timeframe'],
    },
  },
  {
    name: 'get_technical_indicator_sma',
    description: 'Get Simple Moving Average (SMA) technical indicator',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock ticker symbol',
        },
        timeframe: {
          type: 'string',
          description: 'Timeframe (1min, 5min, 15min, 30min, 1hour, 4hour, 1day)',
          enum: ['1min', '5min', '15min', '30min', '1hour', '4hour', '1day'],
        },
        period: {
          type: 'number',
          description: 'Period length (default: 10)',
        },
      },
      required: ['symbol', 'timeframe'],
    },
  },
  {
    name: 'get_technical_indicator_ema',
    description: 'Get Exponential Moving Average (EMA) technical indicator',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock ticker symbol',
        },
        timeframe: {
          type: 'string',
          description: 'Timeframe (1min, 5min, 15min, 30min, 1hour, 4hour, 1day)',
          enum: ['1min', '5min', '15min', '30min', '1hour', '4hour', '1day'],
        },
        period: {
          type: 'number',
          description: 'Period length (default: 10)',
        },
      },
      required: ['symbol', 'timeframe'],
    },
  },
  {
    name: 'get_historical_chart',
    description: 'Get historical price data with flexible time intervals',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock ticker symbol',
        },
        interval: {
          type: 'string',
          description: 'Time interval (1min, 5min, 15min, 30min, 1hour, 4hour)',
          enum: ['1min', '5min', '15min', '30min', '1hour', '4hour'],
        },
        from: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format (optional)',
        },
        to: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format (optional)',
        },
      },
      required: ['symbol', 'interval'],
    },
  },
  {
    name: 'get_institutional_holders',
    description: 'Get institutional ownership (13F filings) for a stock',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock ticker symbol',
        },
        limit: {
          type: 'number',
          description: 'Number of holders to return (default: 100)',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_sp500_constituents',
    description: 'Get list of S&P 500 index constituents',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

/**
 * Create and configure the MCP server
 */
const server = new Server(
  {
    name: 'fmp-mcp-server',
    version: '1.1.0',
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

      case 'get_market_gainers': {
        const data = await fetchFMP('/biggest-gainers');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_market_losers': {
        const data = await fetchFMP('/biggest-losers');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_most_active': {
        const data = await fetchFMP('/most-actives');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_sector_performance': {
        const { date } = args as { date?: string };
        const endpoint = date 
          ? `/sector-performance-snapshot?date=${date}`
          : '/sector-performance-snapshot?date=' + new Date().toISOString().split('T')[0];
        const data = await fetchFMP(endpoint);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_analyst_estimates': {
        const { symbol, period = 'annual', limit = 10 } = args as { 
          symbol: string; 
          period?: string; 
          limit?: number;
        };
        const data = await fetchFMP(`/analyst-estimates?symbol=${symbol.toUpperCase()}&period=${period}&limit=${limit}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_price_target': {
        const { symbol } = args as { symbol: string };
        const data = await fetchFMP(`/price-target-summary?symbol=${symbol.toUpperCase()}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_analyst_ratings': {
        const { symbol } = args as { symbol: string };
        const data = await fetchFMP(`/grades?symbol=${symbol.toUpperCase()}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_insider_trading': {
        const { symbol, limit = 100 } = args as { symbol: string; limit?: number };
        const data = await fetchFMP(`/insider-trading/search?symbol=${symbol.toUpperCase()}&limit=${limit}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_key_metrics': {
        const { symbol, period = 'annual', limit = 5 } = args as { 
          symbol: string; 
          period?: string; 
          limit?: number;
        };
        const data = await fetchFMP(`/key-metrics?symbol=${symbol.toUpperCase()}&period=${period}&limit=${limit}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_financial_ratios': {
        const { symbol, period = 'annual', limit = 5 } = args as { 
          symbol: string; 
          period?: string; 
          limit?: number;
        };
        const data = await fetchFMP(`/ratios?symbol=${symbol.toUpperCase()}&period=${period}&limit=${limit}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_earnings_calendar': {
        const { from, to } = args as { from?: string; to?: string };
        let endpoint = '/earnings-calendar';
        const params = [];
        if (from) params.push(`from=${from}`);
        if (to) params.push(`to=${to}`);
        if (params.length > 0) endpoint += `?${params.join('&')}`;
        const data = await fetchFMP(endpoint);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_economic_calendar': {
        const { from, to } = args as { from?: string; to?: string };
        let endpoint = '/economic-calendar';
        const params = [];
        if (from) params.push(`from=${from}`);
        if (to) params.push(`to=${to}`);
        if (params.length > 0) endpoint += `?${params.join('&')}`;
        const data = await fetchFMP(endpoint);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_economic_indicator': {
        const { name, from, to } = args as { name: string; from?: string; to?: string };
        let endpoint = `/economic-indicators?name=${name}`;
        if (from) endpoint += `&from=${from}`;
        if (to) endpoint += `&to=${to}`;
        const data = await fetchFMP(endpoint);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_technical_indicator_rsi': {
        const { symbol, timeframe, period = 14 } = args as { 
          symbol: string; 
          timeframe: string; 
          period?: number;
        };
        const data = await fetchFMP(`/technical-indicators/rsi?symbol=${symbol.toUpperCase()}&timeframe=${timeframe}&periodLength=${period}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_technical_indicator_sma': {
        const { symbol, timeframe, period = 10 } = args as { 
          symbol: string; 
          timeframe: string; 
          period?: number;
        };
        const data = await fetchFMP(`/technical-indicators/sma?symbol=${symbol.toUpperCase()}&timeframe=${timeframe}&periodLength=${period}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_technical_indicator_ema': {
        const { symbol, timeframe, period = 10 } = args as { 
          symbol: string; 
          timeframe: string; 
          period?: number;
        };
        const data = await fetchFMP(`/technical-indicators/ema?symbol=${symbol.toUpperCase()}&timeframe=${timeframe}&periodLength=${period}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_historical_chart': {
        const { symbol, interval, from, to } = args as { 
          symbol: string; 
          interval: string; 
          from?: string; 
          to?: string;
        };
        let endpoint = `/historical-chart/${interval}?symbol=${symbol.toUpperCase()}`;
        if (from) endpoint += `&from=${from}`;
        if (to) endpoint += `&to=${to}`;
        const data = await fetchFMP(endpoint);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_institutional_holders': {
        const { symbol, limit = 100 } = args as { symbol: string; limit?: number };
        const data = await fetchFMP(`/institutional-ownership/latest?symbol=${symbol.toUpperCase()}&limit=${limit}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_sp500_constituents': {
        const data = await fetchFMP('/sp500-constituent');
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
  
  console.error('FMP MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
