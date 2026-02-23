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

/** Format FMP API response as MCP tool result */
function jsonResponse(data: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
  };
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
    version: '1.1.5',
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
        return jsonResponse(await fetchFMP(`/quote?symbol=${symbol.toUpperCase()}`));
      }

      case 'search_symbol': {
        const { query } = args as { query: string };
        return jsonResponse(await fetchFMP(`/search-symbol?query=${encodeURIComponent(query)}&limit=10`));
      }

      case 'get_company_profile': {
        const { symbol } = args as { symbol: string };
        return jsonResponse(await fetchFMP(`/profile?symbol=${symbol.toUpperCase()}`));
      }

      case 'get_income_statement': {
        const { symbol, period = 'annual', limit = 5 } = args as { symbol: string; period?: string; limit?: number };
        return jsonResponse(await fetchFMP(`/income-statement?symbol=${symbol.toUpperCase()}&period=${period}&limit=${limit}`));
      }

      case 'get_balance_sheet': {
        const { symbol, period = 'annual', limit = 5 } = args as { symbol: string; period?: string; limit?: number };
        return jsonResponse(await fetchFMP(`/balance-sheet-statement?symbol=${symbol.toUpperCase()}&period=${period}&limit=${limit}`));
      }

      case 'get_cash_flow': {
        const { symbol, period = 'annual', limit = 5 } = args as { symbol: string; period?: string; limit?: number };
        return jsonResponse(await fetchFMP(`/cash-flow-statement?symbol=${symbol.toUpperCase()}&period=${period}&limit=${limit}`));
      }

      case 'get_stock_news': {
        const { symbol, limit = 10 } = args as { symbol: string; limit?: number };
        return jsonResponse(await fetchFMP(`/news/stock?symbols=${symbol.toUpperCase()}&limit=${limit}`));
      }

      case 'get_market_gainers':
        return jsonResponse(await fetchFMP('/biggest-gainers'));

      case 'get_market_losers':
        return jsonResponse(await fetchFMP('/biggest-losers'));

      case 'get_most_active':
        return jsonResponse(await fetchFMP('/most-actives'));

      case 'get_sector_performance': {
        const { date } = args as { date?: string };
        const d = date || new Date().toISOString().split('T')[0];
        return jsonResponse(await fetchFMP(`/sector-performance-snapshot?date=${d}`));
      }

      case 'get_analyst_estimates': {
        const { symbol, period = 'annual', limit = 10 } = args as { symbol: string; period?: string; limit?: number };
        return jsonResponse(await fetchFMP(`/analyst-estimates?symbol=${symbol.toUpperCase()}&period=${period}&limit=${limit}`));
      }

      case 'get_price_target': {
        const { symbol } = args as { symbol: string };
        return jsonResponse(await fetchFMP(`/price-target-summary?symbol=${symbol.toUpperCase()}`));
      }

      case 'get_analyst_ratings': {
        const { symbol } = args as { symbol: string };
        return jsonResponse(await fetchFMP(`/grades?symbol=${symbol.toUpperCase()}`));
      }

      case 'get_insider_trading': {
        const { symbol, limit = 100 } = args as { symbol: string; limit?: number };
        return jsonResponse(await fetchFMP(`/insider-trading/search?symbol=${symbol.toUpperCase()}&limit=${limit}`));
      }

      case 'get_key_metrics': {
        const { symbol, period = 'annual', limit = 5 } = args as { symbol: string; period?: string; limit?: number };
        return jsonResponse(await fetchFMP(`/key-metrics?symbol=${symbol.toUpperCase()}&period=${period}&limit=${limit}`));
      }

      case 'get_financial_ratios': {
        const { symbol, period = 'annual', limit = 5 } = args as { symbol: string; period?: string; limit?: number };
        return jsonResponse(await fetchFMP(`/ratios?symbol=${symbol.toUpperCase()}&period=${period}&limit=${limit}`));
      }

      case 'get_earnings_calendar': {
        const { from, to } = args as { from?: string; to?: string };
        const params = [from && `from=${from}`, to && `to=${to}`].filter(Boolean);
        const endpoint = '/earnings-calendar' + (params.length ? `?${params.join('&')}` : '');
        return jsonResponse(await fetchFMP(endpoint));
      }

      case 'get_economic_calendar': {
        const { from, to } = args as { from?: string; to?: string };
        const params = [from && `from=${from}`, to && `to=${to}`].filter(Boolean);
        const endpoint = '/economic-calendar' + (params.length ? `?${params.join('&')}` : '');
        return jsonResponse(await fetchFMP(endpoint));
      }

      case 'get_economic_indicator': {
        const { name: indicator, from, to } = args as { name: string; from?: string; to?: string };
        let endpoint = `/economic-indicators?name=${indicator}`;
        if (from) endpoint += `&from=${from}`;
        if (to) endpoint += `&to=${to}`;
        return jsonResponse(await fetchFMP(endpoint));
      }

      case 'get_technical_indicator_rsi': {
        const { symbol, timeframe, period = 14 } = args as { symbol: string; timeframe: string; period?: number };
        return jsonResponse(await fetchFMP(`/technical-indicators/rsi?symbol=${symbol.toUpperCase()}&timeframe=${timeframe}&periodLength=${period}`));
      }

      case 'get_technical_indicator_sma': {
        const { symbol, timeframe, period = 10 } = args as { symbol: string; timeframe: string; period?: number };
        return jsonResponse(await fetchFMP(`/technical-indicators/sma?symbol=${symbol.toUpperCase()}&timeframe=${timeframe}&periodLength=${period}`));
      }

      case 'get_technical_indicator_ema': {
        const { symbol, timeframe, period = 10 } = args as { symbol: string; timeframe: string; period?: number };
        return jsonResponse(await fetchFMP(`/technical-indicators/ema?symbol=${symbol.toUpperCase()}&timeframe=${timeframe}&periodLength=${period}`));
      }

      case 'get_historical_chart': {
        const { symbol, interval, from, to } = args as { symbol: string; interval: string; from?: string; to?: string };
        let endpoint = `/historical-chart/${interval}?symbol=${symbol.toUpperCase()}`;
        if (from) endpoint += `&from=${from}`;
        if (to) endpoint += `&to=${to}`;
        return jsonResponse(await fetchFMP(endpoint));
      }

      case 'get_institutional_holders': {
        const { symbol, limit = 100 } = args as { symbol: string; limit?: number };
        return jsonResponse(await fetchFMP(`/institutional-ownership/latest?symbol=${symbol.toUpperCase()}&limit=${limit}`));
      }

      case 'get_sp500_constituents':
        return jsonResponse(await fetchFMP('/sp500-constituent'));

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('FMP MCP Server running on stdio\n');
}

main().catch((error) => {
  process.stderr.write(`Fatal error: ${error}\n`);
  process.exit(1);
});
