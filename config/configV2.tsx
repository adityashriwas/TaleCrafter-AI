import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schemaV2 from "./schemaV2";

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL!);
export const dbV2 = drizzle(sql, { schema: schemaV2 });
