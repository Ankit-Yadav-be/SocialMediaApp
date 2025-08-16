// cache.js
import NodeCache from "node-cache";

// stdTTL: default time-to-live (seconds)
// checkperiod: expired keys cleanup interval
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

export default cache;
