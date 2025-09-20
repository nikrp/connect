import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get('conversation_id');

        if (!conversationId) {
            return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('messages')
            .select(`
                id,
                content,
                sender_id,
                receiver_id,
                created_at,
                read,
                sender_profile:profiles!messages_sender_id_fkey (
                    name,
                    profile_photo
                ),
                receiver_profile:profiles!messages_receiver_id_fkey (
                    name,
                    profile_photo
                )
            `)
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { conversation_id, content, receiver_id } = await request.json();

        if (!conversation_id || !content) {
            return NextResponse.json({ error: "Conversation ID and content are required" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('messages')
            .insert({
                conversation_id,
                content,
                sender_id: user.id,
                receiver_id: receiver_id || null,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
