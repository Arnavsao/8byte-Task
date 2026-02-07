# Technical Challenges & Solutions

Building this portfolio dashboard came with a few interesting challenges, especially around getting reliable data without official public APIs. Here's how I tackled them:

## 1. Getting Real-Time Stock Data
The biggest hurdle was that Yahoo Finance and Google Finance don't have free, official public APIs anymore.
- **The Challenge:** I needed live prices (CMP) and financial metrics (P/E, Earnings), but standard fetch requests often get blocked or return HTML instead of JSON.
- **The Solution:** I used the `yahoo-finance2` library for Node.js. It's a robust wrapper that handles the "scraping" mechanics internally. It's much more reliable than trying to parse raw HTML myself. For P/E ratios and earnings, I found that Yahoo Finance actually provides this data too, so I consolidated everything to one source to keep things simple and fast.

## 2. API Rate Limiting & Performance
Fetching data for 50+ stocks one by one is a recipe for getting IP-banned.
- **The Challenge:** If I fired off 50 requests every 15 seconds, Yahoo would block me almost immediately.
- **The Solution:** I implemented two strategies:
    1.  **Batching:** Instead of 50 separate calls, I group stocks into batches (e.g., 5 at a time) with a small delay between batches. This mimics human behavior better than a machine-gun approach.
    2.  **Caching:** I added a simple in-memory cache (`node-cache`) on the backend. If the frontend requests data again within 15 seconds, I serve the cached version instantly. This protects the external API and makes the UI feel snappy.

## 3. Data Consistency
Financial data is messy. sometimes fields like "P/E Ratio" are just missing for certain stocks (like recent IPOs or loss-making companies).
- **The Challenge:** The dashboard would crash or show "NaN" if accurate data wasn't available.
- **The Solution:** I built defensive coding into the data transformation layer. If a value is missing, I default it gracefully (e.g., `0` or slightly older data) rather than letting the whole table break. I also added a "mock data" fallback so the dashboard works even if the internet connection flakiness occurs during a demo.

## 4. Real-Time Updates
Updating the UI every 15 seconds without freezing the browser.
- **The Challenge:** Re-rendering the entire table every few seconds can make the scrolling jerky.
- **The Solution:** I used Next.js and optimized the state updates. The data fetching happens in the background, and React only re-renders the DOM nodes that actually changed (like the price numbers). I also added smooth CSS transitions so the color changes (Green/Red) flash gently instead of flickering.

## 5. Cross-Origin Resource Sharing (CORS)
Since my frontend runs on port 3000 and backend on port 5000, the browser initially blocked the requests.
- **Solution:** Configured strict CORS headers on the Express server to explicitly allow the frontend origin.

Overall, the focus was on building something robust that fails gracefully rather than something that breaks at the first sign of trouble.
