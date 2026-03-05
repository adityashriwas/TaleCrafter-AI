import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, message } = await req.json();

    if (!email || !message) {
      return NextResponse.json(
        { success: false, message: "Email and message are required" },
        { status: 400 }
      );
    }

    const accessKey =
      process.env.FEEDBACK_FORM_KEY ?? process.env.FEEDBAKC_FORM_KEY;

    if (!accessKey) {
      return NextResponse.json(
        { success: false, message: "Feedback form key is not configured" },
        { status: 500 }
      );
    }

    const formData = new FormData();
    formData.append("access_key", accessKey);
    formData.append("email", String(email));
    formData.append("message", String(message));

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to submit feedback" },
      { status: 500 }
    );
  }
}
