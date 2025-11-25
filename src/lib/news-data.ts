export interface Article {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  content: string;
  image?: string;
  category: string;
}

export const articles: Article[] = [
  {
    title: "Welcome to ZilStream V2",
    slug: "welcome-to-zilstream-v2",
    date: "November 20, 2025",
    category: "Announcement",
    excerpt:
      "We're proud to unveil the next generation of the Zilliqa blockchain explorer and analytics platform, built for the future of DeFi.",
    image: "/logo-text-dark.svg",
    content: `
      <p class="lead">Today marks a significant milestone in the Zilliqa ecosystem. We are thrilled to introduce ZilStream V2, a complete reimagining of how you interact with the Zilliqa blockchain.</p>

      <h2>Built for Zilliqa 2.0</h2>
      <p>With the upcoming transition to Zilliqa 2.0, the network is becoming faster, more scalable, and fully EVM-compatible. ZilStream V2 is designed from the ground up to leverage these advancements.</p>
      <p>Our new platform provides seamless support for EVM transactions, tokens, and smart contracts, ensuring that you have the visibility you need as the ecosystem evolves.</p>

      <h2>Key Features at Launch</h2>
      
      <div class="grid md:grid-cols-2 gap-6 my-8 not-prose">
        <div class="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
          <h3 class="text-xl font-semibold mb-2 mt-0">⚡️ Real-time Explorer</h3>
          <p class="text-muted-foreground mb-0">Watch blocks, transactions, and events stream in real-time without refreshing. Our WebSocket-powered backend ensures you never miss a beat.</p>
        </div>
        <div class="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
          <h3 class="text-xl font-semibold mb-2 mt-0">📊 Enhanced Analytics</h3>
          <p class="text-muted-foreground mb-0">Deep dive into token economics, pair liquidity, and volume metrics. We've improved our data indexing to provide more accurate and granular insights.</p>
        </div>
        <div class="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
          <h3 class="text-xl font-semibold mb-2 mt-0">🎨 Modern Design</h3>
          <p class="text-muted-foreground mb-0">A completely refreshed UI/UX that prioritizes readability and ease of use, with first-class dark mode support.</p>
        </div>
        <div class="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
          <h3 class="text-xl font-semibold mb-2 mt-0">📱 Mobile Optimized</h3>
          <p class="text-muted-foreground mb-0">Access ZilStream anywhere, on any device. Our responsive design ensures a great experience on desktop, tablet, and mobile.</p>
        </div>
      </div>

      <h2>Beta Release</h2>
      <p>Please note that ZilStream V2 is currently in <strong>beta</strong> and is still under active development. You may encounter bugs or incomplete features as we continue to refine the platform.</p>
      <p>We are working hard to bring you the full suite of tools you expect. Advanced portfolio tracking and management features are currently in the pipeline and will be available in upcoming updates.</p>

      <h2>The Road Ahead</h2>
      <p>This is just the beginning. We have an exciting roadmap ahead, including portfolio tracking, advanced alerting, and more developer tools. We're committed to building the best analytics platform for the Zilliqa community.</p>
      <p>We invite you to explore the new platform, try out the features, and let us know what you think. Your feedback is invaluable in helping us shape the future of ZilStream.</p>
    `,
  },
  {
    title: "Advanced Charting with TradingView",
    slug: "tradingview-integration",
    date: "November 20, 2025",
    category: "Features",
    image: "/tradingview.svg",
    excerpt:
      "Level up your market analysis with our professional-grade TradingView integration. Technical analysis has never been easier.",
    content: `
      <p class="lead">Understanding market movements requires precise tools. That's why we've integrated the industry-standard TradingView library directly into ZilStream V2.</p>

      <h2>Professional Grade Analysis</h2>
      <p>Whether you're a technical analyst or a casual observer, having the right context is crucial. Our new charts bring the full power of TradingView to every token pair on Zilliqa.</p>

      <div class="my-8 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
        <p class="italic mb-0">"The integration of TradingView charts transforms ZilStream from a simple explorer into a powerful trading companion."</p>
      </div>

      <h2>Chart Features</h2>
      <ul>
        <li><strong>Multiple Timeframes:</strong> From 1-minute candles for scalping to monthly charts for long-term trend analysis.</li>
        <li><strong>100+ Indicators:</strong> RSI, MACD, Bollinger Bands, Moving Averages, and countless others are available at your fingertips.</li>
        <li><strong>Drawing Tools:</strong> Draw trendlines, channels, Fibonacci retracements, and identifying patterns directly on the chart.</li>
        <li><strong>Customizable Appearance:</strong> Adjust candles, colors, and layout to match your trading style.</li>
      </ul>

      <h2>How to Use</h2>
      <p>Navigate to any <strong>Pair Detail</strong> page to see the chart in action. The chart is interactive and saves your local preferences, so your analysis setup remains consistent across visits.</p>
      <p>We're also aggregating price data from multiple DEX sources to ensure the candles you see represent the most accurate market price available on-chain.</p>

      <hr />

      <p>For even more comprehensive financial data, charts, and market analysis tools beyond just crypto, we recommend visiting <a href="https://www.tradingview.com" target="_blank" rel="noopener noreferrer">TradingView.com</a>. It's the platform that powers our charts and is an essential resource for traders worldwide.</p>
    `,
  },
  {
    title: "Sunsetting ZilStream Legacy",
    slug: "sunsetting-zilstream-legacy",
    date: "November 20, 2025",
    category: "Important",
    image: "/logo-faded.svg",
    excerpt:
      "Important information regarding the migration from our legacy platform to V2. Timeline and details inside.",
    content: `
      <p class="lead">Progress requires change. As we focus our efforts on the new V2 platform and Zilliqa 2.0, we will be retiring the legacy ZilStream site.</p>

      <h2>Timeline</h2>
      <p>Please make a note of the following key dates:</p>
      <ul>
        <li><strong>Now:</strong> V2 is live and is the primary version of ZilStream.</li>
        <li><strong>Until January 31st:</strong> <a href="https://legacy.zilstream.com" target="_blank" rel="noopener noreferrer">legacy.zilstream.com</a> will remain accessible for read-only access and historical reference.</li>
        <li><strong>February 1st:</strong> The legacy domain will redirect permanently to the new V2 platform.</li>
      </ul>

      <h2>Why the change?</h2>
      <p>The legacy platform was built for the original Zilliqa Scilla-based ecosystem. With the network's evolution towards EVM compatibility (Zilliqa 2.0), the underlying architecture required a complete overhaul to support standard JSON-RPC methods, new token standards (ERC-20 equivalent), and the faster block times.</p>
      <p>Maintaining two separate codebases splits our development resources. By sunsetting the legacy site, we can dedicate 100% of our attention to making V2 the best it can be.</p>

      <h2>Migration Guide</h2>
      <p>If you have bookmarked specific pages on the old site, please update them to their V2 equivalents. Most token and pair addresses will function similarly, but the URL structure has been simplified.</p>
      <p>Thank you for being part of our journey since the beginning. We look forward to serving you on the new platform!</p>
    `,
  },
];
