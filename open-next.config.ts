import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Default config: no incremental cache (can be enabled later with an R2
// binding, see wrangler.jsonc). No overrides needed for this app.
export default defineCloudflareConfig({});
