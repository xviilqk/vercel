import { NextResponse } from "next/server";


// This route was previously serving mock data. Frontend now hits the Django backend directly.
export async function GET() {
  return NextResponse.json({ detail: `Use backend API at ${process.env.NEXT_PUBLIC_API_URL}/pets/` }, { status: 410 });
}