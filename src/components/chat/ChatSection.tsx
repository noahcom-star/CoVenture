'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import ChatModal from './ChatModal';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ChatSectionProps {
  currentUser: UserProfile;
}

interface ChatRoom {
  id: string;
  title: string;
  updated_at: string;
  otherUser: {
    user_id: string;
    full_name: string;
    avatar_url: string | null;
  };
  lastMessage?: {
    content: string;
    created_at: string;
  };
}

interface RoomData {
  id: string;
  updated_at: string;
  project: {
    title: string;
    creator: {
      user_id: string;
      full_name: string;
      avatar_url: string | null;
    };
  };
  application: {
    applicant: {
      user_id: string;
      full_name: string;
      avatar_url: string | null;
    };
  };
  chat_messages: {
    content: string;
    created_at: string;
    sender_id: string;
  }[] | null;
}

interface ChatPartner {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
}

export default function ChatSection({ currentUser }: ChatSectionProps) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchChatRooms = async () => {
    try {
      console.log('Fetching chat rooms for user:', currentUser.user_id);
      const { data: rooms, error } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          updated_at,
          project:projects!inner(
            title,
            creator:profiles!inner(user_id, full_name, avatar_url)
          ),
          application:project_applications!inner(
            applicant:profiles!inner(user_id, full_name, avatar_url)
          ),
          chat_messages:chat_messages(
            content,
            created_at,
            sender_id
          )
        `)
        .or(`project->creator->user_id.eq.${currentUser.user_id},application->applicant->user_id.eq.${currentUser.user_id}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching chat rooms:', error);
        throw error;
      }

      console.log('Raw chat rooms data:', rooms);

      const processedRooms: ChatRoom[] = (rooms as unknown as RoomData[] || []).map(room => {
        const isCreator = room.project.creator.user_id === currentUser.user_id;
        const otherUser: ChatPartner = isCreator ? room.application.applicant : room.project.creator;
        
        const messages = room.chat_messages || [];
        const sortedMessages = messages.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const lastMessage = sortedMessages[0];

        const processedRoom = {
          id: room.id,
          title: room.project.title,
          updated_at: room.updated_at,
          otherUser: {
            user_id: otherUser.user_id,
            full_name: otherUser.full_name,
            avatar_url: otherUser.avatar_url
          },
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            created_at: lastMessage.created_at
          } : undefined
        };

        console.log('Processed chat room:', processedRoom);
        return processedRoom;
      });

      console.log('Setting chat rooms:', processedRooms);
      setChatRooms(processedRooms);
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchChatRooms:', error);
      toast.error('Failed to load chat rooms');
    }
  };

  const setupRealtimeSubscription = async () => {
    try {
      if (channelRef.current) {
        console.log('Unsubscribing from previous chat section channel...');
        await channelRef.current.unsubscribe();
        channelRef.current = null;
      }

      console.log('Setting up chat section subscription for user:', currentUser.user_id);
      const channel = supabase.channel('chat_rooms', {
        config: {
          broadcast: { self: true },
        },
      });

      // Add channel state change logging
      channel.on('system', { event: '*' }, (payload) => {
        console.log('Chat section channel system event:', payload);
      });

      // Listen for new messages
      channel
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        }, (payload) => {
          console.log('New message in chat section:', payload);
          fetchChatRooms();
        })
        // Listen for chat room updates
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_rooms'
        }, (payload) => {
          console.log('Chat room updated:', payload);
          fetchChatRooms();
        })
        .subscribe((status) => {
          console.log('Chat section subscription status:', status);
        });

      channelRef.current = channel;
    } catch (error) {
      console.error('Error in chat section setupRealtimeSubscription:', error);
      toast.error('Failed to connect to chat updates');
      setTimeout(setupRealtimeSubscription, 3000);
    }
  };

  useEffect(() => {
    fetchChatRooms();
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        console.log('Cleaning up chat updates subscription');
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [currentUser.user_id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="h-[600px] bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl">
      <div className="grid grid-cols-3 h-full">
        {/* Chat Rooms List */}
        <div className="border-r border-[var(--navy-dark)] p-4">
          <h3 className="text-xl font-semibold text-[var(--white)] mb-4">Messages</h3>
          {chatRooms.length > 0 ? (
            <div className="space-y-2">
              {chatRooms.map((room) => (
                <motion.button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    selectedRoom?.id === room.id
                      ? 'bg-[var(--accent)]/20'
                      : 'hover:bg-[var(--navy-dark)]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                    <span className="text-lg text-[var(--accent)]">
                      {room.otherUser.full_name?.[0] || '?'}
                    </span>
                  </div>
                  <div className="ml-3 text-left">
                    <h4 className="text-[var(--white)] font-medium">{room.otherUser.full_name}</h4>
                    <p className="text-sm text-[var(--slate)] truncate">
                      {room.title}
                    </p>
                    {room.lastMessage && (
                      <p className="text-xs text-[var(--slate)] mt-1">
                        {new Date(room.lastMessage.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="text-center text-[var(--slate)]">
              <p>No messages yet.</p>
              <p className="text-sm mt-2">Your chat conversations will appear here.</p>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="col-span-2">
          {selectedRoom ? (
            <ChatModal
              isOpen={true}
              onClose={() => setSelectedRoom(null)}
              chatRoomId={selectedRoom.id}
              currentUser={currentUser}
              otherUser={selectedRoom.otherUser}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--slate)]">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 