# Financial Modeling Prep MCP Server

[![npm version](https://badge.fury.io/js/@houtini%2Ffmp-mcp.svg)](https://badge.fury.io/js/@houtini%2Ffmp-mcp)
[![Known Vulnerabilities](https://snyk.io/test/github/houtini-ai/fmp-mcp/badge.svg)](https://snyk.io/test/github/houtini-ai/fmp-mcp)
[![MCP Registry](https://img.shields.io/badge/MCP-Registry-blue?style=flat-square)](https://registry.modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Model Context Protocol (MCP) server providing access to Financial Modeling Prep's comprehensive financial data API. Get real-time stock quotes, company fundamentals, financial statements, market insights, analyst data, and technical indicators directly in Claude Desktop.

## Features

- **Real-time Market Data**: Live stock quotes with price, volume, and market metrics
- **Company Information**: Detailed profiles including industry, sector, and key executives
- **Financial Statements**: Income statements, balance sheets, and cash flow statements
- **Market Performance**: Track gainers, losers, most active stocks, and sector performance
- **Analyst Data**: Price targets, estimates, ratings, and upgrades/downgrades
- **Insider Trading**: Monitor insider transactions and institutional holdings
- **Technical Indicators**: RSI, SMA, EMA with multiple timeframes
- **Economic Data**: GDP, unemployment, inflation, treasury rates, and economic calendar
- **Historical Charts**: Intraday data from 1-minute to 4-hour intervals
- **Symbol Search**: Find companies by name or ticker across global exchanges

## Installation

### Prerequisites

- [Claude Desktop](https://claude.ai/download)
- Node.js 18 or higher
- Financial Modeling Prep API key ([Get one here](https://financialmodelingprep.com/developer/docs))

### Quick Start with NPX

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "financial-modeling-prep": {
      "command": "npx",
      "args": [
        "-y",
        "@houtini/fmp-mcp"
      ],
      "env": {
        "FMP_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Replace `your_api_key_here` with your actual API key from Financial Modeling Prep.

**Important**: Restart Claude Desktop completely after updating the configuration.

## Available Tools

### Core Market Data

#### `get_quote`
Get real-time stock quote data.

**Parameters:**
- `symbol` (required): Stock ticker symbol (e.g., AAPL, TSLA, MSFT)

**Returns:** Current price, volume, market cap, P/E ratio, day high/low, and more.

#### `search_symbol`
Search for stock symbols by company name or ticker.

**Parameters:**
- `query` (required): Search query (company name or partial ticker)

**Returns:** Matching symbols with company names and exchange information.

### Company Fundamentals

#### `get_company_profile`
Get detailed company profile and fundamental data.

**Parameters:**
- `symbol` (required): Stock ticker symbol

**Returns:** Company description, industry, sector, CEO, employee count, headquarters, website, and key financial metrics.

#### `get_income_statement`
Retrieve company income statement data.

**Parameters:**
- `symbol` (required): Stock ticker symbol
- `period` (optional): "annual" or "quarter" (default: "annual")
- `limit` (optional): Number of periods to return (default: 5)

**Returns:** Revenue, expenses, net income, EPS, and other profitability metrics.

#### `get_balance_sheet`
Retrieve company balance sheet data.

**Parameters:**
- `symbol` (required): Stock ticker symbol
- `period` (optional): "annual" or "quarter" (default: "annual")
- `limit` (optional): Number of periods to return (default: 5)

**Returns:** Assets, liabilities, shareholder equity, and detailed line items.

#### `get_cash_flow`
Retrieve company cash flow statement data.

**Parameters:**
- `symbol` (required): Stock ticker symbol
- `period` (optional): "annual" or "quarter" (default: "annual")
- `limit` (optional): Number of periods to return (default: 5)

**Returns:** Operating cash flow, investing activities, financing activities, and free cash flow.

#### `get_key_metrics`
Get key financial metrics and ratios.

**Parameters:**
- `symbol` (required): Stock ticker symbol
- `period` (optional): "annual" or "quarter" (default: "annual")
- `limit` (optional): Number of periods to return (default: 5)

**Returns:** P/E ratio, ROE, ROA, debt ratios, current ratio, and more.

#### `get_financial_ratios`
Get detailed financial ratios (profitability, liquidity, efficiency).

**Parameters:**
- `symbol` (required): Stock ticker symbol
- `period` (optional): "annual" or "quarter" (default: "annual")
- `limit` (optional): Number of periods to return (default: 5)

**Returns:** Comprehensive ratio analysis including profitability, liquidity, and efficiency metrics.

### Market Performance

#### `get_market_gainers`
Get stocks with the largest price increases.

**Parameters:** None

**Returns:** Top gaining stocks with price changes and volume.

#### `get_market_losers`
Get stocks with the largest price drops.

**Parameters:** None

**Returns:** Top losing stocks with price changes and volume.

#### `get_most_active`
Get most actively traded stocks by volume.

**Parameters:** None

**Returns:** Stocks with highest trading volume.

#### `get_sector_performance`
Get current sector performance snapshot.

**Parameters:**
- `date` (optional): Date in YYYY-MM-DD format (defaults to latest)

**Returns:** Performance metrics for all market sectors.

### Analyst Data

#### `get_analyst_estimates`
Get analyst financial estimates (revenue, EPS forecasts).

**Parameters:**
- `symbol` (required): Stock ticker symbol
- `period` (optional): "annual" or "quarter" (default: "annual")
- `limit` (optional): Number of periods to return (default: 10)

**Returns:** Analyst revenue and earnings estimates with consensus figures.

#### `get_price_target`
Get analyst price target summary.

**Parameters:**
- `symbol` (required): Stock ticker symbol

**Returns:** Average, high, low, and median price targets from analysts.

#### `get_analyst_ratings`
Get analyst ratings and upgrades/downgrades.

**Parameters:**
- `symbol` (required): Stock ticker symbol

**Returns:** Recent analyst rating changes, upgrades, downgrades, and recommendations.

### Insider Trading & Institutional

#### `get_insider_trading`
Get recent insider trading activity.

**Parameters:**
- `symbol` (required): Stock ticker symbol
- `limit` (optional): Number of transactions to return (default: 100)

**Returns:** Insider buy/sell transactions with names, dates, and amounts.

#### `get_institutional_holders`
Get institutional ownership (13F filings).

**Parameters:**
- `symbol` (required): Stock ticker symbol
- `limit` (optional): Number of holders to return (default: 100)

**Returns:** Top institutional holders with share counts and filing dates.

### Technical Indicators

#### `get_technical_indicator_rsi`
Get Relative Strength Index (RSI).

**Parameters:**
- `symbol` (required): Stock ticker symbol
- `timeframe` (required): "1min", "5min", "15min", "30min", "1hour", "4hour", "1day"
- `period` (optional): Period length (default: 14)

**Returns:** RSI values with timestamps for momentum analysis.

#### `get_technical_indicator_sma`
Get Simple Moving Average (SMA).

**Parameters:**
- `symbol` (required): Stock ticker symbol
- `timeframe` (required): "1min", "5min", "15min", "30min", "1hour", "4hour", "1day"
- `period` (optional): Period length (default: 10)

**Returns:** SMA values with timestamps for trend analysis.

#### `get_technical_indicator_ema`
Get Exponential Moving Average (EMA).

**Parameters:**
- `symbol` (required): Stock ticker symbol
- `timeframe` (required): "1min", "5min", "15min", "30min", "1hour", "4hour", "1day"
- `period` (optional): Period length (default: 10)

**Returns:** EMA values with timestamps for trend analysis.

### Historical Data

#### `get_historical_chart`
Get historical price data with flexible time intervals.

**Parameters:**
- `symbol` (required): Stock ticker symbol
- `interval` (required): "1min", "5min", "15min", "30min", "1hour", "4hour"
- `from` (optional): Start date in YYYY-MM-DD format
- `to` (optional): End date in YYYY-MM-DD format

**Returns:** OHLC price data with volume for the specified interval.

### Economic Data

#### `get_economic_calendar`
Get upcoming economic data releases calendar.

**Parameters:**
- `from` (optional): Start date in YYYY-MM-DD format
- `to` (optional): End date in YYYY-MM-DD format

**Returns:** Scheduled economic announcements with dates and expected impact.

#### `get_economic_indicator`
Get economic indicator data (GDP, unemployment, inflation, etc.).

**Parameters:**
- `name` (required): Indicator name (e.g., "GDP", "unemploymentRate", "CPI")
- `from` (optional): Start date in YYYY-MM-DD format
- `to` (optional): End date in YYYY-MM-DD format

**Returns:** Historical values for the specified economic indicator.

### Events & Calendars

#### `get_earnings_calendar`
Get upcoming earnings announcements calendar.

**Parameters:**
- `from` (optional): Start date in YYYY-MM-DD format
- `to` (optional): End date in YYYY-MM-DD format

**Returns:** Upcoming earnings dates with EPS estimates.

### Index Data

#### `get_sp500_constituents`
Get list of S&P 500 index constituents.

**Parameters:** None

**Returns:** All companies in the S&P 500 with symbols and details.

### News (Paid Feature)

#### `get_stock_news`
Get latest news articles for a stock.

**Parameters:**
- `symbol` (required): Stock ticker symbol
- `limit` (optional): Number of articles to return (default: 10)

**Returns:** News headlines, publication dates, URLs, and article summaries.

**Note:** This endpoint requires a paid FMP plan.

## Usage Examples

Once installed, you can interact with the MCP server directly through Claude Desktop:

```
Get a quote for Apple stock
```

```
Show me Tesla's quarterly income statements for the last 8 quarters
```

```
What are today's biggest market gainers?
```

```
Get analyst price targets for NVIDIA
```

```
Show me insider trading activity for Microsoft
```

```
Calculate the 14-day RSI for TSLA on the daily timeframe
```

```
What's the current sector performance?
```

```
Get upcoming earnings announcements for this week
```

```
Show me institutional holders of Amazon
```

## API Rate Limits

Financial Modeling Prep offers different pricing tiers:

- **Free Tier**: 250 requests/day
- **Starter**: 500 requests/day  
- **Professional**: 1,000+ requests/day

See [FMP Pricing](https://financialmodelingprep.com/developer/docs/pricing) for current plans and limits.

## Development

### Local Installation

```bash
git clone https://github.com/houtini-ai/fmp-mcp.git
cd fmp-mcp
npm install
npm run build
```

### Claude Desktop Configuration for Local Development

```json
{
  "mcpServers": {
    "financial-modeling-prep": {
      "command": "node",
      "args": [
        "/absolute/path/to/fmp-mcp/build/index.js"
      ],
      "env": {
        "FMP_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Building

```bash
npm run build
```

Output goes to the `build/` directory.

## API Coverage

This MCP server implements 29 endpoints from the Financial Modeling Prep API:

**Core Market Data** (3)
- Stock quotes, symbol search, company profiles

**Financial Statements** (6)
- Income statement, balance sheet, cash flow, key metrics, financial ratios (annual & quarterly)

**Market Performance** (4)
- Gainers, losers, most active, sector performance

**Analyst Data** (3)
- Estimates, price targets, ratings

**Insider & Institutional** (2)
- Insider trading, institutional holders

**Technical Indicators** (3)
- RSI, SMA, EMA with multiple timeframes

**Historical Data** (1)
- Intraday charts (1min to 4hour)

**Economic Data** (2)
- Economic calendar, economic indicators

**Events & Calendars** (1)
- Earnings calendar

**Index Data** (1)
- S&P 500 constituents

**News** (1)
- Stock news (paid feature)

For the complete API reference, see the [FMP Developer Documentation](https://site.financialmodelingprep.com/developer/docs).

## Troubleshooting

### MCP Server Not Appearing in Claude Desktop

1. Verify your `claude_desktop_config.json` syntax is valid JSON
2. Check that the `FMP_API_KEY` environment variable is set
3. Restart Claude Desktop completely (quit from system tray/menu bar)
4. Check Claude Desktop logs for error messages

### API Authentication Errors

If you see `403 Forbidden` errors:
- Verify your API key is correct
- Check you haven't exceeded your rate limit
- Ensure your API key has the required permissions

### Tool Execution Failures

- Verify the stock symbol exists (use `search_symbol` first)
- Check your internet connection
- Verify FMP API is operational at [status.financialmodelingprep.com](https://financialmodelingprep.com)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Resources

- [Financial Modeling Prep API](https://financialmodelingprep.com)
- [MCP Documentation](https://modelcontextprotocol.io)
- [Claude Desktop](https://claude.ai/download)

## Acknowledgments

Built with the [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk) by Anthropic.
