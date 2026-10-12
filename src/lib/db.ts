import mongoose from "mongoose";
import dns from "dns";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // ignore
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

function isSrvFailure(error: unknown): boolean {
  const err = error as { code?: string; syscall?: string; message?: string };
  const msg = String(err?.message || error || "");
  return (
    err?.code === "ECONNREFUSED" ||
    err?.code === "ENOTFOUND" ||
    err?.code === "ETIMEOUT" ||
    err?.syscall === "querySrv" ||
    msg.includes("querySrv") ||
    msg.includes("ECONNREFUSED")
  );
}

/** Dedicated resolver — global dns.setServers is unreliable under Next.js/Turbopack. */
function publicResolver() {
  const resolver = new dns.promises.Resolver();
  resolver.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
  return resolver;
}

/**
 * Convert mongodb+srv:// → mongodb:// host list using an explicit public DNS resolver.
 */
async function buildStandardUriFromSrv(srvUri: string): Promise<string> {
  const parsed = new URL(srvUri);
  const hostname = parsed.hostname;
  const resolver = publicResolver();

  const records = await resolver.resolveSrv(`_mongodb._tcp.${hostname}`);
  if (!records.length) {
    throw new Error(`No SRV records for ${hostname}`);
  }

  const hosts = records
    .sort((a, b) => a.priority - b.priority || b.weight - a.weight)
    .map((r) => `${r.name}:${r.port}`)
    .join(",");

  let txtParams = "";
  try {
    const txt = await resolver.resolveTxt(hostname);
    txtParams = txt.map((chunks) => chunks.join("")).join("&");
  } catch {
    // optional
  }

  const auth =
    parsed.username || parsed.password
      ? `${decodeURIComponent(parsed.username)}:${decodeURIComponent(parsed.password)}@`
      : "";

  const dbPath = parsed.pathname || "/";
  const merged = new URLSearchParams(txtParams);
  const fromUri = new URLSearchParams(parsed.search);
  fromUri.forEach((value, key) => {
    if (!merged.has(key)) merged.set(key, value);
  });

  if (!merged.has("tls") && !merged.has("ssl")) {
    merged.set("tls", "true");
  }

  const qs = merged.toString();
  return `mongodb://${auth}${hosts}${dbPath}${qs ? `?${qs}` : ""}`;
}

async function connectWithUri(uri: string): Promise<typeof mongoose> {
  return mongoose.connect(uri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 12_000,
    family: 4,
  });
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  // Prefer non-SRV URI when provided (avoids querySrv entirely on Windows/Next)
  const MONGODB_URI =
    process.env.MONGODB_URI_STANDARD?.trim() ||
    process.env.MONGODB_URI?.trim();

  if (!MONGODB_URI) {
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = (async () => {
      const isSrv = MONGODB_URI.startsWith("mongodb+srv://");

      // Already a standard seed-list URI — connect directly
      if (!isSrv) {
        return connectWithUri(MONGODB_URI);
      }

      // Resolve SRV via public Resolver first (skips broken Node querySrv)
      try {
        const standardUri = await buildStandardUriFromSrv(MONGODB_URI);
        return await connectWithUri(standardUri);
      } catch (resolveError) {
        console.warn(
          "[MongoDB] Resolver SRV failed; trying native mongodb+srv://",
          resolveError instanceof Error ? resolveError.message : resolveError
        );
      }

      try {
        return await connectWithUri(MONGODB_URI);
      } catch (firstError) {
        if (isSrvFailure(firstError)) {
          // Last attempt: resolve again then connect (in case transient)
          const standardUri = await buildStandardUriFromSrv(MONGODB_URI);
          return connectWithUri(standardUri);
        }
        throw firstError;
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    console.error("Failed to connect to MongoDB:", e);
    return null;
  }
}
