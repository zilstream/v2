import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
import {
  withFilter,
  softTagFilter,
} from "@opennextjs/cloudflare/overrides/tag-cache/tag-cache-filter";

export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: doQueue,
  tagCache: withFilter({
    tagCache: d1NextTagCache,
    filterFn: softTagFilter,
  }),
  enableCacheInterception: true,
});
