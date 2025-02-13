import { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { UserProfile } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', chatRoomId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel(`chat_room:${chatRoomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${chatRoomId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatRoomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase.from('chat_messages').insert({
        room_id: chatRoomId,
        sender_id: currentUser.user_id,
        content: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="absolute inset-0 flex flex-col bg-[var(--navy-light)] rounded-xl overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
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
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2 hover:bg-[var(--navy-dark)] rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-[var(--slate)]" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-4 space-y-4">
              {loading ? (
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
                      <p className="break-words">{message.content}</p>
                      <span className="text-xs opacity-75 mt-1 block">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
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
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-[var(--navy-dark)] bg-[var(--navy-light)]">
            <form onSubmit={sendMessage} className="flex space-x-2">
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
                className="px-4 py-2 bg-[var(--accent)] text-[var(--navy-dark)] rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                Send
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 