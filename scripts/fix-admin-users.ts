/**
 * Fix legacy adminusers in MongoDB after role/password normalization.
 * Usage: npx tsx scripts/fix-admin-users.ts
 *
 * Does NOT print secrets.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";

function loadEnv(filePath: string) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnv(resolve(process.cwd(), ".env.local"));
loadEnv(resolve(process.cwd(), ".env"));

function isBcryptHash(value: string | undefined): boolean {
  return Boolean(value && /^\$2[aby]\$\d{2}\$/.test(value));
}

async function main() {
  const { connectToDatabase } = await import("../src/lib/db");
  const { AdminUserModel } = await import("../src/lib/models");
  const { normalizeRole, isBcryptHash: repoIsBcrypt } = await import(
    "../src/lib/adminUserRepository"
  );

  const conn = await connectToDatabase();
  if (!conn) {
    console.error("[FAIL] Cannot connect to MongoDB");
    process.exit(1);
  }

  const defaultPassword =
    process.env.ADMIN_PASSWORD?.trim() || "Admin@123456";
  if (defaultPassword.length < 12) {
    console.error("[FAIL] ADMIN_PASSWORD must be at least 12 characters");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const seeds = [
    {
      email: (process.env.ADMIN_EMAIL || "admin@xonails.com").trim().toLowerCase(),
      name: "Master Administrator",
      role: "Admin" as const,
    },
    {
      email: "wholesale@xonails.com",
      name: "Wholesale Partner (B2B)",
      role: "Wholesale" as const,
    },
    {
      email: "customer@xonails.com",
      name: "VIP Retail Customer",
      role: "Customer" as const,
    },
  ];

  console.log("=== Fix adminusers (xon_nail) ===");

  // 1) Normalize every existing document
  const all = await AdminUserModel.find().lean();
  for (const doc of all) {
    const role = normalizeRole(doc.role);
    const needsRoleFix = doc.role !== role;
    const hash = String(doc.passwordHash || "");
    const needsHashFix = !isBcryptHash(hash) && !repoIsBcrypt(hash);

    if (!needsRoleFix && !needsHashFix) {
      console.log(`[OK] ${doc.email} — role=${role}, bcrypt=yes`);
      continue;
    }

    await AdminUserModel.updateOne(
      { _id: doc._id },
      {
        $set: {
          role,
          ...(needsHashFix ? { passwordHash } : {}),
          status: doc.status === "inactive" ? "inactive" : "active",
        },
      }
    );
    console.log(
      `[FIXED] ${doc.email} — role ${String(doc.role)} → ${role}` +
        (needsHashFix ? ", passwordHash re-hashed" : "")
    );
  }

  // 2) Upsert seed accounts
  for (const seed of seeds) {
    const existing = await AdminUserModel.findOne({ email: seed.email });
    if (existing) {
      await AdminUserModel.updateOne(
        { _id: existing._id },
        {
          $set: {
            name: seed.name,
            role: seed.role,
            status: "active",
            passwordHash: isBcryptHash(String(existing.passwordHash || ""))
              ? existing.passwordHash
              : passwordHash,
          },
        }
      );
      console.log(`[UPSERT] ${seed.email} (${seed.role}) — updated`);
    } else {
      await AdminUserModel.create({
        name: seed.name,
        email: seed.email,
        role: seed.role,
        status: "active",
        passwordHash,
      });
      console.log(`[UPSERT] ${seed.email} (${seed.role}) — created`);
    }
  }

  const finalCount = await AdminUserModel.countDocuments();
  console.log(`\n✅ Done. adminusers count=${finalCount}`);
  console.log("   Password set from ADMIN_PASSWORD (value not printed).");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
