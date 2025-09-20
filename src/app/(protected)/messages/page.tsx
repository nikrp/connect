"use client"

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, User } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface Message {
    id: string;
    content: string;
    sender_id: string;
    receiver_id: string;
    created_at: string;
    read: boolean;
    sender_profile?: {
        name: string;
        profile_photo?: string;
    };
    receiver_profile?: {
        name: string;
        profile_photo?: string;
    };
}

interface Conversation {
    id: string;
    other_user: {
        id: string;
        name: string;
        profile_photo?: string;
    };
    last_message?: {
        content: string;
        created_at: string;
        sender_id: string;
    };
    unread_count: number;
}

export default function Messages() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const { user } = useUser() as { user: SupabaseUser };
    const searchParams = useSearchParams();

    // Fetch conversations
    const fetchConversations = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .rpc('get_user_conversations');

            if (error) {
                toast.error("Error fetching conversations:", {
                    description: error.message,
                });
                return;
            }

            setConversations(data || []);
        } catch (error) {
            toast.error("Error fetching conversations:", {
                description: "An unexpected error occurred",
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch messages for a conversation
    const fetchMessages = async (conversationId: string) => {
        try {
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
                .or(`conversation_id.eq.${conversationId}`)
                .order('created_at', { ascending: true });

            if (error) {
                toast.error("Error fetching messages:", {
                    description: error.message,
                });
                return;
            }

            setMessages(data || []);
        } catch (error) {
            toast.error("Error fetching messages:", {
                description: "An unexpected error occurred",
            });
        }
    };

    // Send a message
    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: selectedConversation,
                    content: newMessage.trim(),
                    sender_id: user.id,
                });

            if (error) {
                toast.error("Error sending message:", {
                    description: error.message,
                });
                return;
            }

            setNewMessage("");
            // Refresh messages
            fetchMessages(selectedConversation);
        } catch (error) {
            toast.error("Error sending message:", {
                description: "An unexpected error occurred",
            });
        }
    };

    // Start a new conversation
    const startConversation = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .rpc('create_or_get_conversation', {
                    user1_id: user.id,
                    user2_id: userId
                });

            if (error) {
                toast.error("Error starting conversation:", {
                    description: error.message,
                });
                return;
            }

            setSelectedConversation(data.id);
            fetchMessages(data.id);
            fetchConversations(); // Refresh conversations list
        } catch (error) {
            toast.error("Error starting conversation:", {
                description: "An unexpected error occurred",
            });
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation);
        }
    }, [selectedConversation]);

    // Handle URL parameter for opening specific conversation
    useEffect(() => {
        const conversationId = searchParams.get('conversation');
        if (conversationId) {
            setSelectedConversation(conversationId);
        }
    }, [searchParams]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-foreground/75">Loading messages...</p>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Conversations List */}
            <div className="w-1/3 border-r p-4">
                <h2 className="text-lg font-semibold mb-4">Messages</h2>
                <div className="space-y-2">
                    {conversations.length === 0 ? (
                        <p className="text-foreground/75 text-sm">No conversations yet</p>
                    ) : (
                        conversations.map((conversation) => (
                            <Card
                                key={conversation.id}
                                className={`cursor-pointer hover:bg-accent/50 ${
                                    selectedConversation === conversation.id ? 'bg-accent' : ''
                                }`}
                                onClick={() => setSelectedConversation(conversation.id)}
                            >
                                <CardContent className="p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                                {conversation.other_user.name}
                                            </p>
                                            {conversation.last_message && (
                                                <p className="text-sm text-foreground/75 truncate">
                                                    {conversation.last_message.content}
                                                </p>
                                            )}
                                        </div>
                                        {conversation.unread_count > 0 && (
                                            <Badge variant="destructive" className="text-xs">
                                                {conversation.unread_count}
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <>
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-foreground/75">No messages yet</p>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${
                                            message.sender_id === user.id ? 'justify-end' : 'justify-start'
                                        }`}
                                    >
                                        <div
                                            className={`max-w-xs px-3 py-2 rounded-lg ${
                                                message.sender_id === user.id
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted'
                                            }`}
                                        >
                                            <p className="text-sm">{message.content}</p>
                                            <p className="text-xs opacity-70 mt-1">
                                                {new Date(message.created_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="border-t p-4">
                            <div className="flex gap-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            sendMessage();
                                        }
                                    }}
                                />
                                <Button onClick={sendMessage} size="icon">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <MessageCircle className="w-12 h-12 mx-auto text-foreground/50 mb-4" />
                            <p className="text-foreground/75">Select a conversation to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
