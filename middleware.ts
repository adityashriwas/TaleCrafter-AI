import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { retirementResponse } from "./lib/retirement.mjs";

export default function middleware(request: NextRequest) {
  return retirementResponse(request) ?? NextResponse.next();
}

export const config = { matcher: ["/((?!_next/).*)"] };
