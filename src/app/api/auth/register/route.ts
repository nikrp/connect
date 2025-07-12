// This API route is to handler regitering users into Supabase.
// TODO: Complete the registration flow with Supabase after 
//       writing the main app with manual data and manual users.

import { NextResponse } from "next/server";

/**
 * Recieve completed form from the frontend and register the user + add their data.
 * @param request Form data from the registration form on the frontend.
 * @returns {NextResponse} - Response with either .success being true or false with a .statusText.
 */
export async function POST(request: Request) {}