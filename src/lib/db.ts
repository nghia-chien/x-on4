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

function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);
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

/** Dedicated resolver — used only as a Windows/local fallback when querySrv breaks. */
function publicResolver() {
  const resolver = new dns.promises.Resolver();
  resolver.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
  return resolver;
}

/**
 * Convert mongodb+srv:// → mongodb:// host list using an explicit public DNS resolver.
 * Avoid on Vercel — native SRV works there; custom DNS to 8.8.8.8 can hang/fail.
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
    // Serverless-friendly: few sockets per isolate
    maxPoolSize: isVercelRuntime() ? 5 : 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: isVercelRuntime() ? 8_000 : 12_000,
    socketTimeoutMS: 45_000,
    maxIdleTimeMS: 60_000,
    family: 4,
  });
}

function pickMongoUri(): string | undefined {
  const srv = process.env.MONGODB_URI?.trim();
  const standard = process.env.MONGODB_URI_STANDARD?.trim();

  // Vercel / Linux: prefer native mongodb+srv (driver DNS works)
  if (isVercelRuntime()) {
    return srv || standard;
  }

  // Windows local: prefer non-SRV seed list to avoid querySrv ECONNREFUSED
  if (process.platform === "win32") {
    return standard || srv;
  }

  return srv || standard;
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const MONGODB_URI = pickMongoUri();

  if (!MONGODB_URI) {
    console.error(
      "[MongoDB] Missing MONGODB_URI (set it in Vercel → Project → Settings → Environment Variables)"
    );
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = (async () => {
      const isSrv = MONGODB_URI.startsWith("mongodb+srv://");
      const onVercel = isVercelRuntime();

      // Standard seed-list URI — connect directly
      if (!isSrv) {
        return connectWithUri(MONGODB_URI);
      }

      // Vercel / non-Windows: native SRV first (correct path for Atlas + serverless)
      if (onVercel || process.platform !== "win32") {
        try {
          return await connectWithUri(MONGODB_URI);
        } catch (firstError) {
          console.warn(
            "[MongoDB] Native SRV connect failed:",
            firstError instanceof Error ? firstError.message : firstError
          );
          if (isSrvFailure(firstError) && !onVercel) {
            const standardUri = await buildStandardUriFromSrv(MONGODB_URI);
            return connectWithUri(standardUri);
          }
          throw firstError;
        }
      }

      // Windows local: resolve SRV via public DNS, then fall back to native
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
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[MongoDB] Failed to connect:", msg);
    // Common Vercel cause: Atlas Network Access does not allow 0.0.0.0/0
    if (msg.includes("whitelist") || msg.includes("IP that isn't")) {
      console.error(
        "[MongoDB] Fix: Atlas → Network Access → Allow Access from Anywhere (0.0.0.0/0)"
      );
    }
    return null;
  }
}
