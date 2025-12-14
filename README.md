# Financial Modeling Prep MCP Server

Model Context Protocol (MCP) server providing access to Financial Modeling Prep's comprehensive financial data API. Get real-time stock quotes, company fundamentals, financial statements, and market news directly in Claude Desktop.

[![npm version](https://badge.fury.io/js/@houtini%2Ffmp-mcp.svg)](https://badge.fury.io/js/@houtini%2Ffmp-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Real-time Market Data**: Live stock quotes with price, volume, and market metrics ✅ Free
- **Company Information**: Detailed profiles including industry, sector, and key executives ✅ Free
- **Financial Statements**: Income statements, balance sheets, and cash flow statements ✅ Free
- **Symbol Search**: Find companies by name or ticker across global exchanges ✅ Free
- **Stock News**: Latest news articles and market sentiment for specific symbols 💰 Paid Only

> **Note**: Some features require a paid Financial Modeling Prep plan. The free tier provides access to fundamental data, quotes, and financial statements. News endpoints and certain advanced features require a paid subscription. See [API Limitations](#api-limitations) for details.

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

### `get_quote`
Get real-time stock quote data.

**Parameters:**
- `symbol` (required): Stock ticker symbol (e.g., AAPL, TSLA, MSFT)

**Returns:** Current price, volume, market cap, P/E ratio, day high/low, and more.

### `search_symbol`
Search for stock symbols by company name or ticker.

**Parameters:**
- `query` (required): Search query (company name or partial ticker)

**Returns:** Matching symbols with company names and exchange information.

### `get_company_profile`
Get detailed company profile and fundamental data.

**Parameters:**
- `symbol` (required): Stock ticker symbol

**Returns:** Company description, industry, sector, CEO, employee count, headquarters, website, and key financial metrics.

### `get_income_statement`
Retrieve company income statement data.

**Parameters:**
- `symbol` (required): Stock ticker symbol
- `period` (optional): "annual" or "quarter" (default: "annual")
- `limit` (optional): Number of periods to return (default: 5)

**Returns:** Revenue, expenses, net income, EPS, and other profitability metrics.

### `get_balance_sheet`
Retrieve company balance sheet data.

**Parameters:**
- `symbol` (required): Stock ticker symbol
- `period` (optional): "annual" or "quarter" (default: "annual")
- `limit` (optional): Number of periods to return (default: 5)

**Returns:** Assets, liabilities, shareholder equity, and detailed line items.

### `get_cash_flow`
Retrieve company cash flow statement data.

**Parameters:**
- `symbol` (required): Stock ticker symbol
- `period` (optional): "annual" or "quarter" (default: "annual")
- `limit` (optional): Number of periods to return (default: 5)

**Returns:** Operating cash flow, investing activities, financing activities, and free cash flow.

### `get_stock_news` 💰 Paid Only
Get latest news articles for a stock.

**Parameters:**
- `symbol` (required): Stock ticker symbol
- `limit` (optional): Number of articles to return (default: 10)

**Returns:** News headlines, publication dates, URLs, and article summaries.

**Note:** This endpoint requires a paid FMP plan. Free tier users will receive a 402 Payment Required error.

## Usage Examples

Once installed, you can interact with the MCP server directly through Claude Desktop:

```
Get a quote for Apple stock
```

```
Show me Tesla's quarterly income statements for the last 8 quarters
```

```
Compare the P/E ratios of Microsoft and Google
```

```
Search for semiconductor companies
```

```
Get recent news about NVIDIA
```

## API Rate Limits

Financial Modeling Prep offers different pricing tiers:

- **Free Tier**: 250 requests/day
- **Starter**: 500 requests/day  
- **Professional**: 1,000+ requests/day

See [FMP Pricing](https://financialmodelingprep.com/developer/docs/pricing) for current plans and limits.

## API Limitations

### Free Tier Access

The following features are **included** in the free tier:
- ✅ Real-time stock quotes (`get_quote`)
- ✅ Company profiles (`get_company_profile`)
- ✅ Financial statements - Income, Balance Sheet, Cash Flow (`get_income_statement`, `get_balance_sheet`, `get_cash_flow`)
- ✅ Symbol search (`search_symbol`)

### Paid Plan Required

The following features require a **paid subscription**:
- 💰 Stock news (`get_stock_news`) - Returns 402 Payment Required on free tier
- 💰 Other premium endpoints (not yet implemented in this MCP)

If you attempt to use a paid endpoint with a free API key, you'll receive:
```
Error: FMP API error: 402 Payment Required
```

To access these features, upgrade your plan at [FMP Pricing](https://site.financialmodelingprep.com/pricing-plans).

## Development

### Local Installation

```bash
git clone https://github.com/yourusername/fmp-mcp.git
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
        "C:\\path\\to\\fmp-mcp\\build\\index.js"
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

This MCP server implements 7 core endpoints from the Financial Modeling Prep API:

- Stock Quote
- Symbol Search
- Company Profile
- Income Statement
- Balance Sheet
- Cash Flow Statement
- Stock News

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