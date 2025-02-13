'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import ChatModal from './ChatModal';

interface ChatSectionProps {
  currentUser: UserProfile;
}

interface ChatRoom {
  id: string;
  project_id: string;
  application_id: string;
  created_at: string;
  updated_at: string;
  project: {
    title: string;
    creator: UserProfile;
  };
  application: {
    applicant: UserProfile;
  };
  last_message?: {
    content: string;
    created_at: string;
  };
}

export default function ChatSection({ currentUser }: ChatSectionProps) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    
    fetchChatRooms();

    // Subscribe to changes in chat rooms
    const chatRoomsSubscription = supabase
      .channel('chat-rooms-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms'
        },
        (payload) => {
          console.log('Chat room change received:', payload);
          fetchChatRooms();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          console.log('Chat message change received:', payload);
          fetchChatRooms();
        }
      )
      .subscribe();

    return () => {
      chatRoomsSubscription.unsubscribe();
    };
  }, [currentUser]);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      console.log('Fetching chat rooms for user:', currentUser.user_id);
      
      // First, get all chat rooms where the user is involved
      const { data: rooms, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          project:projects!inner (
            title,
            creator_id,
            creator:profiles!projects_creator_id_fkey (
              user_id,
              full_name,
              avatar_url
            )
          ),
          application:project_applications!inner (
            applicant_id,
            applicant:profiles!project_applications_applicant_id_fkey (
              user_id,
              full_name,
              avatar_url
            )
          ),
          chat_messages!inner (
            content,
            created_at,
            sender_id
          )
        `)
        .or(`project.creator_id.eq.${currentUser.user_id},application.applicant_id.eq.${currentUser.user_id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Process the rooms to include the latest message
      const processedRooms = rooms?.map(room => ({
        ...room,
        last_message: room.chat_messages?.[room.chat_messages.length - 1]
      }));

      console.log('Fetched and processed chat rooms:', processedRooms);
      setChatRooms(processedRooms || []);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      toast.error('Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (room: ChatRoom) => {
    const isCreator = room.project.creator.user_id === currentUser.user_id;
    return isCreator ? room.application.applicant : room.project.creator;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="h-[600px] bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl overflow-hidden">
      <div className="grid grid-cols-3 h-full">
        {/* Chat Rooms List */}
        <div className="border-r border-[var(--navy-dark)] overflow-y-auto">
          <div className="p-4 border-b border-[var(--navy-dark)]">
            <h3 className="text-xl font-semibold text-[var(--white)]">Messages</h3>
          </div>
          
          <div className="overflow-y-auto h-[calc(100%-73px)]">
            {chatRooms.length > 0 ? (
              <div className="space-y-1 p-2">
                {chatRooms.map((room) => {
                  const otherUser = getOtherUser(room);
                  return (
                    <motion.button
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                        selectedRoom?.id === room.id
                          ? 'bg-[var(--accent)]/20'
                          : 'hover:bg-[var(--navy-dark)]'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg text-[var(--accent)]">
                          {otherUser.full_name?.[0] || '?'}
                        </span>
                      </div>
                      <div className="ml-3 text-left flex-1 min-w-0">
                        <h4 className="text-[var(--white)] font-medium truncate">
                          {otherUser.full_name}
                        </h4>
                        <p className="text-sm text-[var(--slate)] truncate">
                          {room.project.title}
                        </p>
                        {room.last_message && (
                          <p className="text-xs text-[var(--slate)] mt-1">
                            {new Date(room.last_message.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-[var(--slate)] p-4">
                <p>No messages yet</p>
                <p className="text-sm mt-2">Your chat conversations will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="col-span-2 h-full flex flex-col">
          {selectedRoom ? (
            <div className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-[var(--navy-dark)] flex items-center">
                <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                  <span className="text-lg text-[var(--accent)]">
                    {getOtherUser(selectedRoom).full_name?.[0] || '?'}
                  </span>
                </div>
                <div className="ml-3">
                  <h4 className="text-[var(--white)] font-medium">
                    {getOtherUser(selectedRoom).full_name}
                  </h4>
                  <p className="text-sm text-[var(--slate)]">
                    {selectedRoom.project.title}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="ml-auto p-2 hover:bg-[var(--navy-dark)] rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-[var(--slate)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-hidden">
                <ChatModal
                  isOpen={true}
                  onClose={() => setSelectedRoom(null)}
                  chatRoomId={selectedRoom.id}
                  currentUser={currentUser}
                  otherUser={getOtherUser(selectedRoom)}
                />
              </div>
            </div>
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