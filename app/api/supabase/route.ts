import { NextRequest, NextResponse } from 'next/server';
import { saveSurvey, getSurveys } from '@/app/lib/actions';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { hobbies, zipCode } = await req.json();
    const cookiesInstance = await cookies();
     // <-- Await cookies
    const data = await saveSurvey(hobbies, zipCode);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Save survey error:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await getSurveys();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Get surveys error:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}