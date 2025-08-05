// This API route is to handle confirm links from password resets.
import { createClient } from "@/lib/supabase/server";
import Requests from "@/src/app/(protected)/requests/page";
import { NextResponse } from "next/server";

/**
 * Recieve code from paramters in the url and verify it using supabases verifyOtp.
 * @param request Code from the email link.
 * @returns {NextResponse} - Response with either .success being true or false with a .statusText.
 */
export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("token_hash");
    const email = searchParams.get("email") || undefined;

    if (!code) {
        return NextResponse.json({
            success: false,
            statusText: "No code provided."
        }, { status: 400, statusText: "No code provided" })
    }
    
    console.log({ 
        type: 'recovery', 
        token_hash: code,
        email: email,
    })

    const { data, error } = await supabase.auth.verifyOtp({ 
        type: 'recovery', 
        token: code,
        email: email ?? '',
    });

    if (!error) {
        return NextResponse.redirect("/reset-password")
        console.log(data);
    }

    return NextResponse.json({
        success: false,
        statusText: error.message
    }, { status: 400, statusText: error.message })
}