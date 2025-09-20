import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get conversations where user is either sender or receiver
        const { data, error } = await supabase
            .from('conversations')
            .select(`
                id,
                user1_id,
                user2_id,
                created_at,
                last_message_id,
                last_message:messages!conversations_last_message_id_fkey (
                    content,
                    created_at,
                    sender_id
                )
            `)
            .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
            .order('updated_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Transform data to include other user info and unread count
        const conversations = await Promise.all(
            (data || []).map(async (conv) => {
                const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
                
                // Get other user's profile
                const { data: otherUserProfile } = await supabase
                    .from('profiles')
                    .select('name, profile_photo')
                    .eq('id', otherUserId)
                    .single();

                // Get unread count
                const { count: unreadCount } = await supabase
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('conversation_id', conv.id)
                    .eq('receiver_id', user.id)
                    .eq('read', false);

                return {
                    id: conv.id,
                    other_user: {
                        id: otherUserId,
                        name: otherUserProfile?.name || 'Unknown User',
                        profile_photo: otherUserProfile?.profile_photo
                    },
                    last_message: conv.last_message,
                    unread_count: unreadCount || 0
                };
            })
        );

        return NextResponse.json(conversations);
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

        const { user2_id } = await request.json();

        if (!user2_id) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        if (user2_id === user.id) {
            return NextResponse.json({ error: "Cannot start conversation with yourself" }, { status: 400 });
        }

        // Check if conversation already exists
        const { data: existingConv } = await supabase
            .from('conversations')
            .select('id')
            .or(`and(user1_id.eq.${user.id},user2_id.eq.${user2_id}),and(user1_id.eq.${user2_id},user2_id.eq.${user.id})`)
            .single();

        if (existingConv) {
            return NextResponse.json(existingConv);
        }

        // Create new conversation
        const { data, error } = await supabase
            .from('conversations')
            .insert({
                user1_id: user.id,
                user2_id: user2_id
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
