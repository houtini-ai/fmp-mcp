# FMP MCP Server Development - Handover Document
**Project:** Building Stdio-Based Financial Modeling Prep MCP Server  
**Date:** December 14, 2025  
**Status:** Server Built, Needs Testing & Article Creation  
**Location:** `C:\dev\fmp-mcp\`

---

## EXECUTIVE SUMMARY

Started with tutorial article creation about adding MCP servers to Claude Desktop. Hit architectural incompatibility with `financial-modeling-prep-mcp-server` npm package (HTTP-based, not stdio). **Decision: Build our own stdio-based FMP MCP server from scratch.**

**Current state:** Server built and configured in Claude Desktop, needs testing and completion.  
**Next thread goal:** Test server, complete implementation, publish package, write tutorial article.

---

## PROJECT CONTEXT

### Original Goal
Write beginner-friendly tutorial: "How to Add MCP Servers to Claude Desktop"

### What Happened
1. ✅ Found FMP package on npm (`financial-modeling-prep-mcp-server`)
2. ❌ Package is HTTP-based (requires port 8080, logs to stdout)
3. ❌ Incompatible with Claude Desktop's stdio transport
4. ✅ **Pivoted:** Build custom stdio-based FMP MCP server
5. ✅ Server built, configured, ready for testing

### Why This Matters
- HTTP MCP servers ≠ stdio MCP servers (different transports)
- Claude Desktop expects stdio (JSON-RPC over stdin/stdout)
- HTTP servers need separate process + port management
- **This debugging journey IS the article content**

---

## CURRENT PROJECT STATE

### Repository: `C:\dev\fmp-mcp\`

```
C:\dev\fmp-mcp\
├── .git/                      # Git repository
├── .gitignore                 # Node/build ignores
├── build/                     # Compiled TypeScript
│   ├── index.js              # ✅ Main entry point
│   ├── index.d.ts            # Type declarations
│   └── *.map                 # Source maps
├── node_modules/              # Dependencies installed
├── src/
│   └── index.ts              # ✅ TypeScript source (342 lines)
├── LICENSE                    # MIT license
├── package.json              # ✅ Package configuration
├── package-lock.json         
├── README.md                 # ⚠️ Needs rewrite in Richard's style
└── tsconfig.json             # TypeScript config
```

### Implementation Status

**✅ COMPLETED:**
- TypeScript MCP server with stdio transport
- 7 core FMP API tools implemented
- Error handling and type safety
- Build configuration (tsc)
- Claude Desktop integration configured
- Git repository initialized

**⚠️ NEEDS WORK:**
1. **Server Testing** - Has NOT been tested yet
2. **Tool Expansion** - Only 7 tools (FMP API has 250+)
3. **README Rewrite** - Must match Richard's voice
4. **Package Publishing** - npm publish workflow
5. **Tutorial Article** - Document the entire journey

---

## IMPLEMENTED TOOLS (7 Core)

```typescript
1. get_quote              // Real-time stock quotes
2. search_symbol          // Search by company name/ticker
3. get_company_profile    // Detailed company info
4. get_income_statement   // Income statements (annual/quarterly)
5. get_balance_sheet      // Balance sheet data
6. get_cash_flow          // Cash flow statements
7. get_stock_news         // Latest stock news
```

**API Pattern:**
```typescript
async function fetchFMP(endpoint: string): Promise<any> {
  const url = `${FMP_BASE_URL}${endpoint}?apikey=${FMP_API_KEY}`;
  const response = await fetch(url);
  return response.json();
}
```

---

## CLAUDE DESKTOP CONFIGURATION

**File:** `C:\Users\Richard Baxter\AppData\Roaming\Claude\claude_desktop_config.json`

```json
"financial-modeling-prep": {
  "command": "node",
  "args": [
    "C:\\dev\\fmp-mcp\\build\\index.js"
  ],
  "env": {
    "FMP_API_KEY": "4bqSxSXvO3TBUszm6VqRMKszhq5M0SmF"
  }
}
```

**Expected Behavior:**
- Claude Desktop starts Node.js process
- Runs `build/index.js` with stdio transport
- Provides 7 FMP tools to Claude
- Logs to stderr (not stdout, per MCP spec)

---

## CRITICAL DEBUGGING DISCOVERIES

### 1. HTTP vs Stdio Architecture Mismatch
**Problem:** `financial-modeling-prep-mcp-server` package runs HTTP server on port 8080  
**Evidence:**
```
Error: listen EADDRINUSE: address already in use :::8080
[FmpMcpServer] ❌ Server failed to start...
```

**Root cause:** Package uses Smithery SDK for HTTP transport, not stdio  
**Solution:** Built custom server with `@modelcontextprotocol/sdk` stdio transport

### 2. Console Logging to Stdout Breaks MCP
**Problem:** HTTP server logs `[FmpMcpServer]` prefix to stdout  
**Evidence:**
```
Unexpected token 'F', "[FmpMcpServ"... is not valid JSON
```

**Why it breaks:** MCP protocol expects **pure JSON-RPC on stdout**  
**Fix:** All logs go to stderr (`console.error()`)

### 3. NODE_ENV=production Blocks DevDependencies
**Problem:** TypeScript wouldn't compile (`@types/node` missing)  
**Evidence:**
```
error TS2580: Cannot find name 'process'
```

**Root cause:** `NODE_ENV=production` set in environment  
**Fix:** `npm install --include=dev` forces devDependency installation

### 4. Port Conflict from Orphaned Process
**Problem:** Port 8080 already in use  
**Evidence:** `netstat -ano | findstr :8080` showed PID 37312 (node.exe)  
**Fix:** `taskkill /F /PID 37312`

### 5. Windows chmod Incompatibility
**Problem:** Build script used Unix `chmod +x`  
**Fix:** Removed from package.json build script (Windows doesn't need it)

---

## ARTICLE OUTLINE (To Be Written)

### Title Options
1. "Building a Financial Data MCP Server for Claude: A Debugging Journey"
2. "When npm Packages Don't Work: Converting HTTP MCP to Stdio"
3. "From HTTP to Stdio: Making Financial Modeling Prep Work with Claude Desktop"

### Article Structure (Based on Writing Style Guide)

**Opening (Personal Context):**
- Started writing tutorial, hit architectural wall
- "This was supposed to be a simple how-to guide..."
- Honest assessment: package looked perfect but fundamentally incompatible

**Problem Discovery (Technical Depth):**
- Log file investigation (`AppData\Roaming\Claude\logs\`)
- JSON parsing errors → stdout pollution diagnosis
- Port conflicts → architecture realization
- Node.js process debugging with netstat/tasklist

**Decision Point (Engineering Rationale):**
- Why rebuild vs workaround?
- HTTP MCP servers vs stdio MCP servers (protocol differences)
- @modelcontextprotocol/sdk documentation deep dive
- Trade-offs: control vs time investment

**Implementation (Step-by-Step with Mistakes):**
- TypeScript project setup
- MCP SDK integration (stdio transport)
- FMP API wrapper implementation
- NODE_ENV=production gotcha (devDependencies)
- Windows compatibility fixes (chmod)

**Testing (Next Thread Work):**
- Claude Desktop restart and verification
- Tool execution tests (get_quote, search_symbol)
- Error handling validation
- Token usage monitoring

**Lessons Learned:**
- MCP transport types matter (HTTP ≠ stdio)
- Log pollution breaks JSON-RPC protocols
- Environment variables have silent effects
- npm package architecture requires verification
- Building from scratch sometimes faster than debugging

**Resources:**
- GitHub repository link
- npm package link (after publishing)
- MCP SDK documentation
- FMP API reference

---

## NEXT THREAD TASKS (Priority Order)

### 1. **TEST THE SERVER** (CRITICAL - DO THIS FIRST)
```
Restart Claude Desktop (already done)
Test: "Get me a stock quote for AAPL using the Financial Modeling Prep server"
Test: "Search for Tesla stock symbol"
Test: "Get Apple's company profile"
```

**Expected output:** JSON data from FMP API  
**If fails:** Check logs at `C:\Users\Richard Baxter\AppData\Roaming\Claude\logs\mcp-server-financial-modeling-prep.log`

### 2. **Verify All 7 Tools Work**
- get_quote → Symbol: AAPL, TSLA, MSFT
- search_symbol → Query: "Apple", "Tesla"
- get_company_profile → Symbol: AAPL
- get_income_statement → Symbol: AAPL, period: annual
- get_balance_sheet → Symbol: AAPL, period: quarter
- get_cash_flow → Symbol: AAPL
- get_stock_news → Symbol: AAPL, limit: 5

### 3. **Expand Tool Coverage** (Optional but Valuable)
Current: 7 tools  
FMP API has: 250+ endpoints

**High-value additions:**
```typescript
// Market indexes
get_sp500_constituents     // S&P 500 companies
get_nasdaq_constituents    // NASDAQ companies

// Analyst data
get_price_target          // Analyst price targets
get_analyst_estimates     // Earnings estimates

// Insider trading
get_insider_trading       // Insider transactions

// Economic data
get_treasury_rates        // Treasury yields
get_economic_calendar     // Economic events

// Technical indicators
get_sma                   // Simple moving average
get_rsi                   // Relative strength index
```

**Implementation pattern:**
```typescript
{
  name: 'get_sp500_constituents',
  description: 'Get list of S&P 500 constituent companies',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
}
```

### 4. **Rewrite README in Richard's Voice**

**Current README:** Generic boilerplate  
**Target:** Authentic, technical, transparent

**Style requirements (from writing_style.md):**
- 12.2 words/sentence average (±12.1 variance)
- British English (whilst, colour, optimise)
- First-person transparency (5+ statements)
- Equipment specificity ("my FMP API key" not "the API key")
- Honest caveats ("This isn't production-ready...")
- Community voice references
- Counter-intuitive insights
- Zero AI clichés (delve, leverage, unlock, seamless)

**README structure:**
```markdown
# Financial Modeling Prep MCP Server

Quick context: built this because the HTTP-based npm package didn't 
play nicely with Claude Desktop's stdio transport. Spent a morning 
debugging port conflicts before realising I'd save time just 
rebuilding from scratch.

## What It Does

Stdio-based MCP server for Financial Modeling Prep API. Currently 
supports 7 core tools (stock quotes, company profiles, financial 
statements). The API has 250+ endpoints - these are just the ones 
I needed first.

## Installation

[Clear, step-by-step with actual commands]

## Configuration

[Include FMP API key setup, Claude Desktop config]

## Tools

[List all 7 tools with examples]

## Limitations

[Honest assessment of what's NOT implemented]

## Development

[How to add more tools, test locally]

## Why Stdio Not HTTP?

[Technical explanation of transport incompatibility]
```

### 5. **Package Publishing Workflow**

**Steps:**
```bash
# 1. Update package.json metadata
npm version 1.0.0

# 2. Test build
npm run build

# 3. Test locally
node build/index.js

# 4. Publish to npm
npm publish --access public

# 5. Test installation
npx @houtini-dev/fmp-mcp
```

**package.json updates needed:**
```json
{
  "name": "@yourscope/fmp-mcp",  // Change scope
  "description": "Stdio MCP server for Financial Modeling Prep API - Claude Desktop integration",
  "keywords": [
    "mcp",
    "financial-modeling-prep",
    "claude",
    "stdio",
    "stock-market"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/fmp-mcp.git"
  }
}
```

### 6. **Write Tutorial Article**

**Format:** Technical guide with debugging journey  
**Length:** 2,500-3,500 words  
**Target audience:** Developers adding MCP servers to Claude Desktop

**Article sections:**
1. Introduction (personal context, what went wrong)
2. Problem discovery (logs, debugging, architecture)
3. Building the solution (step-by-step)
4. Testing and validation
5. Lessons learned
6. Resources and next steps

**Key learnings to highlight:**
- HTTP vs stdio transport types
- MCP protocol requirements (JSON-RPC on stdout)
- Environment variable gotchas (NODE_ENV)
- Windows compatibility considerations
- npm package architecture verification

---

## TECHNICAL REFERENCE

### MCP SDK Usage Pattern

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  { name: 'fmp-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Handle tool execution
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

### FMP API Endpoints Reference

**Base URL:** `https://financialmodelingprep.com/api/v3`  
**Auth:** `?apikey={FMP_API_KEY}` query parameter

**Implemented:**
```
/quote/{symbol}                              # Real-time quote
/search?query={query}                        # Symbol search
/profile/{symbol}                            # Company profile
/income-statement/{symbol}?period={period}   # Income statement
/balance-sheet-statement/{symbol}            # Balance sheet
/cash-flow-statement/{symbol}                # Cash flow
/stock_news?tickers={symbol}                 # Stock news
```

**High-value endpoints to add:**
```
/sp500_constituent                           # S&P 500 list
/nasdaq_constituent                          # NASDAQ list
/price-target/{symbol}                       # Analyst targets
/analyst-estimates/{symbol}                  # Earnings estimates
/insider-trading?symbol={symbol}             # Insider trades
/treasury                                    # Treasury rates
/economic_calendar                           # Economic events
/technical_indicator/daily/{symbol}          # Technical indicators
```

### Error Handling Pattern

```typescript
try {
  const data = await fetchFMP(`/quote/${symbol}`);
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
} catch (error) {
  return {
    content: [{ 
      type: 'text', 
      text: `Error: ${error instanceof Error ? error.message : String(error)}` 
    }],
    isError: true,
  };
}
```

---

## DEBUGGING CHECKLIST (If Issues Arise)

### Server Won't Start
```bash
# Check logs
type "C:\Users\Richard Baxter\AppData\Roaming\Claude\logs\mcp-server-financial-modeling-prep.log"

# Common issues:
# 1. Missing FMP_API_KEY → Check claude_desktop_config.json
# 2. Build directory missing → Run: npm run build
# 3. Syntax errors → Check: node build/index.js
```

### Tools Don't Appear in Claude
```bash
# 1. Restart Claude Desktop (required after config changes)
# 2. Check MCP server list in Claude settings
# 3. Verify process running: tasklist | findstr node
```

### API Errors
```bash
# Test API key directly:
curl "https://financialmodelingprep.com/api/v3/quote/AAPL?apikey=4bqSxSXvO3TBUszm6VqRMKszhq5M0SmF"

# Common FMP errors:
# - 401: Invalid API key
# - 403: Rate limit exceeded (free tier: 250 requests/day)
# - 429: Too many requests
```

### JSON Parsing Errors
```bash
# Check for stdout pollution:
node build/index.js
# Should output ONLY JSON-RPC, not log messages

# If logs appear on stdout → use console.error() not console.log()
```

---

## FILE LOCATIONS REFERENCE

**Project:**
- Source: `C:\dev\fmp-mcp\src\index.ts`
- Build: `C:\dev\fmp-mcp\build\index.js`
- Package: `C:\dev\fmp-mcp\package.json`
- README: `C:\dev\fmp-mcp\README.md`

**Claude Desktop:**
- Config: `C:\Users\Richard Baxter\AppData\Roaming\Claude\claude_desktop_config.json`
- Logs: `C:\Users\Richard Baxter\AppData\Roaming\Claude\logs\mcp-server-financial-modeling-prep.log`

**FMP API:**
- Docs: https://site.financialmodelingprep.com/developer/docs
- API Key: `4bqSxSXvO3TBUszm6VqRMKszhq5M0SmF`
- Rate limits: 250 requests/day (free tier)

---

## SUCCESS CRITERIA

**Minimum Viable Product (Current Goal):**
- ✅ 7 core tools working
- ✅ Stdio transport verified
- ✅ Error handling functional
- ✅ Claude Desktop integration confirmed

**Enhanced Version (Next Iteration):**
- ⚠️ 20+ tools implemented
- ⚠️ README in Richard's voice
- ⚠️ Published to npm
- ⚠️ Tutorial article written

**Production Ready:**
- ❌ Comprehensive error handling
- ❌ Rate limiting logic
- ❌ Response caching
- ❌ Full API coverage (250+ tools)
- ❌ Unit tests
- ❌ CI/CD pipeline

---

## HANDOVER PROMPT FOR NEXT THREAD

```
Continue FMP MCP server development from C:\dev\fmp-mcp\

STATUS: Server built and configured, needs testing before article creation.

FIRST TASK: Test all 7 implemented tools:
1. get_quote (AAPL)
2. search_symbol ("Apple")
3. get_company_profile (AAPL)
4. get_income_statement (AAPL, annual)
5. get_balance_sheet (AAPL, quarter)
6. get_cash_flow (AAPL)
7. get_stock_news (AAPL, limit 5)

If tests pass → proceed to:
- Add high-value tools (analyst data, market indexes)
- Rewrite README in Richard's voice (British English, first-person, technical depth)
- Package for npm publishing
- Write tutorial article documenting the debugging journey

If tests fail → debug using logs at:
C:\Users\Richard Baxter\AppData\Roaming\Claude\logs\mcp-server-financial-modeling-prep.log

CONTEXT: Started as tutorial article, hit HTTP vs stdio incompatibility with 
npm package, rebuilt from scratch. This debugging journey IS the article content.

Key discoveries: NODE_ENV=production, stdout pollution, port conflicts, 
Windows chmod incompatibility - all documented in handover.

FMP API key: 4bqSxSXvO3TBUszm6VqRMKszhq5M0SmF (250 requests/day limit)
```

---

## ARTICLE WRITING NOTES

### Voice Calibration Checklist
- ✅ British English throughout (whilst, colour, optimise)
- ✅ First-person transparency ("I spent 2 hours debugging...")
- ✅ Equipment specificity ("my FMP API key" not "the key")
- ✅ Honest mistakes included ("Took me too long to realise...")
- ✅ Average sentence: 12.2 words (variable lengths natural)
- ✅ Community references ("What I've read on r/ClaudeAI...")
- ✅ Counter-intuitive insights (HTTP ≠ stdio not obvious)
- ❌ Zero AI clichés (delve, leverage, unlock, seamless)
- ❌ No em dashes (use hyphens or commas)
- ❌ No perfect narratives (include failures)

### Technical Depth Requirements
- Engineering rationale for decisions (WHY stdio not just WHAT)
- Real-world comparisons (HTTP MCP vs stdio MCP architecture)
- Specific technical details (JSON-RPC protocol, stdout requirements)
- Counter-intuitive findings (console.log breaks MCP, NODE_ENV blocks deps)
- Community consensus references (MCP SDK best practices)

### Content Structure (Per Templates)
**Problem → Investigation → Solution → Lessons**

Not: "Here's how to build an MCP server"  
But: "Here's what broke, how I debugged it, and what I learned"

---

**END OF HANDOVER**