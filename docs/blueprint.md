# **App Name**: Signals Live

## Core Features:

- Snapshot Ingestion: Accepts snapshots of trading signal data from MT4 via a POST request to the /api/snapshot endpoint. The most recent snapshot for each symbol and timeframe combination is stored in memory, overwriting older values.
- Data Caching with TTL: Implements an in-memory cache for storing the trading signal snapshots with a Time-To-Live (TTL) of 10 minutes. Snapshots older than 10 minutes are automatically discarded to ensure data freshness.  Utilizes the Express server to manage and serve these snapshots.
- Snapshots Retrieval: Provides a GET endpoint (/api/snapshots) to retrieve all current snapshots from the in-memory cache. The API automatically filters out expired snapshots before returning the data, so that the values displayed reflect current conditions. This endpoint ensures that users receive the most relevant data available.
- Real-time Data Display: Renders the trading signal data in real-time on a user dashboard. The data is displayed within cards, each representing a specific trading pair and timeframe, that indicate current winrate, the direction of the most recent signal, market status, and snapshot age.
- Health Check Endpoint: Provides a health check endpoint (/api/health) that returns the status of the API and the number of snapshots currently stored in memory. This endpoint will provide insights into the data available, or alert to unexpected system behaviors.
- Config Page: Displays a placeholder page at /config indicating that configurations are received from MT4.  This setup simplifies the initial configuration of the app, as well as all later updates and modifications.  Future enhancement is possible through generative AI tools which may improve config as new data relationships are discovered by a tool.
- Automated Refresh and Filtering: Allows users to set an auto-refresh interval (2s/5s/10s) to fetch the latest snapshots automatically. Implements filters to narrow down the displayed signals based on trading pair and timeframe, that empowers users to focus on the instruments that align with their strategies.

## Style Guidelines:

- Primary color: Neon green (#00FFAA) for a vibrant and standout signal highlight.
- Background color: Dark gray (#0D0D0D) for a 'Black Piano' dark mode theme.
- Accent color: Dark purple (#AA00FF) as an analogous complement to the neon green, to create a hi-tech mood. The dark purple provides contrast and complements the primary neon green, especially well on a dark background.
- Font: 'Inter' sans-serif, for clear and modern readability throughout the app.
- Code font: 'Source Code Pro' for any code snippets that need to be displayed
- Utilize icons from 'lucide-react' for a consistent and modern visual language.
- Cards with subtle shadows and rounded borders (lg/2xl) for a polished dark mode aesthetic.
- Subtle hover animations on cards and fade-in effects during data loading.