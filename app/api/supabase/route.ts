import { NextRequest, NextResponse } from 'next/server';
import { saveSurvey, getSurveys } from '@/app/lib/actions';

export async function POST(req: NextRequest) {
  try {
    const { hobbies, zipCode } = await req.json();
    const data = await saveSurvey(hobbies, String(zipCode));
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    let message = "Unknown error";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    } else if (error && typeof error === "object" && "message" in error) {
      message = String((error as { message: unknown }).message);
    }
    console.error("Save survey error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await getSurveys();
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    let message = "Unknown error";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    } else if (error && typeof error === "object" && "message" in error) {
      message = String((error as { message: unknown }).message);
    }
    console.error("Get surveys error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}