import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { UserProfile } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

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
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    let subscription: any = null;
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;

    const setupRealtimeSubscription = async () => {
      try {
        console.log(`Setting up subscription for room ${chatRoomId}...`);
        
        // Remove any existing subscription
        if (subscription) {
          subscription.unsubscribe();
        }

        // Subscribe to the chat_messages table for this room
        subscription = supabase
          .channel(`room:${chatRoomId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${chatRoomId}`,
          }, (payload) => {
            console.log('Received real-time message:', payload);
            if (mounted) {
              setMessages(prev => {
                // Check if message already exists to prevent duplicates
                const exists = prev.some(msg => msg.id === payload.new.id);
                if (!exists) {
                  return [...prev, payload.new as ChatMessage];
                }
                return prev;
              });
              scrollToBottom();
            }
          })
          .subscribe((status) => {
            console.log(`Subscription status for room ${chatRoomId}:`, status);
            
            if (status === 'SUBSCRIBED') {
              console.log('Successfully subscribed to room:', chatRoomId);
              setRetryCount(0); // Reset retry count on successful subscription
            } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
              console.error('Subscription error:', status);
              handleSubscriptionError();
            }
          });

      } catch (error) {
        console.error('Error setting up subscription:', error);
        handleSubscriptionError();
      }
    };

    const handleSubscriptionError = () => {
      if (retryCount < maxRetries && mounted) {
        console.log(`Retrying subscription... Attempt ${retryCount + 1}/${maxRetries}`);
        setRetryCount(prev => prev + 1);
        retryTimeout = setTimeout(setupRealtimeSubscription, 2000 * Math.pow(2, retryCount));
      } else if (mounted) {
        toast.error('Failed to connect to chat. Please try again later.');
      }
    };

    // Initial setup
    fetchMessages();
    setupRealtimeSubscription();

    // Cleanup function
    return () => {
      mounted = false;
      if (subscription) {
        console.log('Cleaning up subscription...');
        subscription.unsubscribe();
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [chatRoomId, retryCount]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching messages for room:', chatRoomId);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', chatRoomId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      console.log('Fetched messages:', data);
      setMessages(data || []);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    try {
      console.log('Sending message to room:', chatRoomId);
      
      const messageToSend = newMessage.trim();
      setNewMessage(''); // Clear input immediately for better UX

      const { error } = await supabase
        .from('chat_messages')
        .insert([
          {
            room_id: chatRoomId,
            sender_id: currentUser.user_id,
            content: messageToSend,
          },
        ]);

      if (error) throw error;
      
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Restore the message in case of error
      setNewMessage(newMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[var(--navy-light)] rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden"
      >
        {/* Chat Header */}
        <div className="p-4 border-b border-[var(--accent)]/10 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--white)]">
            Chat with {otherUser.full_name}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--accent)]/10 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-[var(--accent)]" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="h-[60vh] overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-[var(--slate)]">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === currentUser.user_id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender_id === currentUser.user_id
                      ? 'bg-[var(--accent)] text-[var(--navy-dark)]'
                      : 'bg-[var(--navy-dark)] text-[var(--white)]'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="p-4 border-t border-[var(--accent)]/10">
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
              className="bg-[var(--accent)] text-[var(--navy-dark)] rounded-lg px-4 py-2 hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 