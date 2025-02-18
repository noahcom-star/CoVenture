import { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { UserProfile } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatRoomId: string;
  currentUser: UserProfile;
  otherUser: UserProfile;
}

interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function ChatModal({
  isOpen,
  onClose,
  chatRoomId,
  currentUser,
  otherUser,
}: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    fetchMessages();
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        console.log('Cleaning up subscription for room:', chatRoomId);
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [chatRoomId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', chatRoomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Sort messages by timestamp
      const sortedMessages = (data || []).sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      setMessages(sortedMessages);
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const setupRealtimeSubscription = async () => {
    try {
      if (channelRef.current) {
        console.log('Unsubscribing from previous channel...');
        await channelRef.current.unsubscribe();
        channelRef.current = null;
      }

      console.log('Setting up new subscription for room:', chatRoomId);
      const channel = supabase.channel(`room:${chatRoomId}`, {
        config: {
          broadcast: { self: true },
        },
      });

      // Add channel state change logging
      channel.on('system', { event: '*' }, (payload) => {
        console.log('Channel system event:', payload);
      });

      channel
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${chatRoomId}`,
        }, (payload) => {
          console.log('New message payload:', payload);
          
          if (payload.new) {
            const newMessage = payload.new as ChatMessage;
            console.log('Processing new message:', newMessage);
            
            setMessages(prev => {
              // Prevent duplicate messages
              if (prev.some(msg => msg.id === newMessage.id)) {
                console.log('Duplicate message detected, skipping...');
                return prev;
              }
              
              console.log('Adding new message to state');
              const updated = [...prev, newMessage].sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
              return updated;
            });
            
            setTimeout(scrollToBottom, 100);
          }
        })
        .subscribe(async (status) => {
          console.log(`Subscription status for room ${chatRoomId}:`, status);
          
          if (status === 'SUBSCRIBED') {
            console.log('Fetching messages after subscription...');
            await fetchMessages();
          }
        });

      channelRef.current = channel;
    } catch (error) {
      console.error('Error in setupRealtimeSubscription:', error);
      toast.error('Failed to connect to chat');
      setTimeout(setupRealtimeSubscription, 3000);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messageToSend = newMessage.trim();
      setNewMessage(''); // Clear input immediately

      const now = new Date().toISOString();
      console.log('Sending message to room:', chatRoomId);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([
          {
            room_id: chatRoomId,
            sender_id: currentUser.user_id,
            content: messageToSend,
            created_at: now
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error inserting message:', error);
        throw error;
      }

      console.log('Message sent successfully:', data);

      // Optimistically add message to state
      setMessages(prev => {
        const updated = [...prev, data].sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        return updated;
      });
      
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast.error('Failed to send message');
      // Restore the message in the input if it failed to send
      setNewMessage(newMessage);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="w-full max-w-lg bg-[var(--navy-light)] rounded-xl shadow-xl overflow-hidden"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--navy-dark)]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                  <span className="text-lg text-[var(--accent)]">
                    {otherUser.full_name?.[0] || '?'}
                  </span>
                </div>
                <div>
                  <h3 className="text-[var(--white)] font-medium">
                    {otherUser.full_name}
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[var(--navy-dark)] rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-[var(--slate)]" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--accent)]" />
                </div>
              ) : messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === currentUser.user_id
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.sender_id === currentUser.user_id
                          ? 'bg-[var(--accent)] text-[var(--navy-dark)]'
                          : 'bg-[var(--navy-dark)] text-[var(--white)]'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-[var(--slate)]">
                  No messages yet. Start the conversation!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-[var(--navy-dark)]">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-[var(--navy-dark)] text-[var(--white)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-[var(--accent)] text-[var(--navy-dark)] rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 