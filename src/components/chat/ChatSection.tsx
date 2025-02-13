'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import ChatModal from './ChatModal';

interface ChatSectionProps {
  currentUser: UserProfile;
}

interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ChatRoom {
  id: string;
  project_id: string;
  application_id: string;
  created_at: string;
  updated_at: string;
  project: {
    title: string;
    creator_id: string;
    creator: UserProfile;
  };
  application: {
    applicant_id: string;
    applicant: UserProfile;
  };
  chat_messages?: ChatMessage[];
  last_message?: ChatMessage;
}

export default function ChatSection({ currentUser }: ChatSectionProps) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      console.log('Fetching chat rooms for user:', currentUser.user_id);
      
      const { data: rooms, error } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          project_id,
          application_id,
          created_at,
          updated_at,
          project:projects(
            id,
            title,
            creator_id,
            creator:profiles(
              user_id,
              full_name,
              avatar_url
            )
          ),
          application:project_applications(
            id,
            applicant_id,
            applicant:profiles(
              user_id,
              full_name,
              avatar_url
            )
          ),
          chat_messages(
            id,
            content,
            created_at,
            sender_id
          )
        `)
        .or(`project->creator_id.eq.${currentUser.user_id},application->applicant_id.eq.${currentUser.user_id}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching chat rooms:', error);
        throw error;
      }

      // Process and sort messages for each room
      const processedRooms = (rooms || []).map(room => {
        // Ensure we have the correct structure
        const processedRoom: ChatRoom = {
          id: room.id,
          project_id: room.project_id,
          application_id: room.application_id,
          created_at: room.created_at,
          updated_at: room.updated_at,
          project: {
            title: room.project?.title || '',
            creator_id: room.project?.creator_id || '',
            creator: room.project?.creator || { user_id: '', full_name: '', avatar_url: '' }
          },
          application: {
            applicant_id: room.application?.applicant_id || '',
            applicant: room.application?.applicant || { user_id: '', full_name: '', avatar_url: '' }
          },
          chat_messages: room.chat_messages?.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ) || [],
          last_message: room.chat_messages?.[0]
        };
        return processedRoom;
      });

      console.log('Processed chat rooms:', processedRooms);
      setChatRooms(processedRooms);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      toast.error('Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    
    const setupRealtimeSubscription = async () => {
      try {
        // Clean up existing subscription if any
        if (channelRef.current) {
          await channelRef.current.unsubscribe();
        }

        // Create new channel for chat updates
        const channel = supabase.channel('chat_updates', {
          config: {
            broadcast: { self: true },
            presence: { key: currentUser.user_id }
          }
        });

        // Subscribe to chat room changes
        channel
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'chat_messages'
            },
            (payload) => {
              console.log('New message received in any room:', payload);
              fetchChatRooms();
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'chat_rooms'
            },
            (payload) => {
              console.log('Chat room updated:', payload);
              fetchChatRooms();
            }
          );

        // Subscribe and log the status
        const status = await channel.subscribe(async (status) => {
          console.log('Chat updates subscription status:', status);
        });

        console.log('Chat updates subscription successful:', status);
        channelRef.current = channel;
      } catch (error) {
        console.error('Error in setupRealtimeSubscription:', error);
        toast.error('Failed to connect to chat updates');
      }
    };

    fetchChatRooms();
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        console.log('Cleaning up chat updates subscription');
        channelRef.current.unsubscribe();
      }
    };
  }, [currentUser]);

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
    <div className="h-[600px] bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl">
      <div className="grid grid-cols-3 h-full">
        {/* Chat Rooms List */}
        <div className="border-r border-[var(--navy-dark)] p-4">
          <h3 className="text-xl font-semibold text-[var(--white)] mb-4">Messages</h3>
          {chatRooms.length > 0 ? (
            <div className="space-y-2">
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
                    <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                      <span className="text-lg text-[var(--accent)]">
                        {otherUser.full_name?.[0] || '?'}
                      </span>
                    </div>
                    <div className="ml-3 text-left">
                      <h4 className="text-[var(--white)] font-medium">{otherUser.full_name}</h4>
                      <p className="text-sm text-[var(--slate)] truncate">
                        {room.project.title}
                      </p>
                      {room.last_message && (
                        <p className="text-xs text-[var(--slate)] mt-1">
                          {new Date(room.last_message.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </motion.button>
                );
              })}
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
              otherUser={getOtherUser(selectedRoom)}
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