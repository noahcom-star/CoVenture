'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { Avatar, TextField, IconButton, Typography, Paper, CircularProgress } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { ChatMessage, ChatRoom, UserProfile } from '@/types/profile';

interface ChatProps {
  projectId: string;
  applicationId: string;
  currentUser: UserProfile;
  otherUser: UserProfile;
}

interface ChatRoomData {
  id: string;
}

export default function Chat({ projectId, applicationId, currentUser, otherUser }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
  }, [projectId, applicationId]);

  useEffect(() => {
    if (roomId) {
      const subscription = supabase
        .channel(`room:${roomId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${roomId}`
          },
          () => {
            fetchMessages();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      // Check if chat room exists
      let { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('project_id', projectId)
        .eq('application_id', applicationId)
        .single();

      if (roomError && roomError.code !== 'PGRST116') {
        throw roomError;
      }

      let chatRoom: ChatRoomData;

      if (!room) {
        // Create new chat room
        const { data: newRoom, error: createError } = await supabase
          .from('chat_rooms')
          .insert({
            project_id: projectId,
            application_id: applicationId
          })
          .select()
          .single();

        if (createError) throw createError;
        if (!newRoom) throw new Error('Failed to create chat room');
        chatRoom = newRoom;
      } else {
        chatRoom = room;
      }

      setRoomId(chatRoom.id);
      await fetchMessages();
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast.error('Failed to initialize chat');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!roomId) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:sender_id (
            id,
            user_id,
            full_name,
            avatar_url
          )
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          sender_id: currentUser.id,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96">
      <div className="flex items-center space-x-2 p-4 border-b">
        <Avatar src={otherUser?.avatar_url} />
        <Typography variant="subtitle1">
          {otherUser?.full_name}
        </Typography>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender_id === currentUser.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div className={`flex items-start space-x-2 max-w-[70%] ${
              message.sender_id === currentUser.id ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <Avatar
                src={message.sender?.avatar_url}
                className="w-8 h-8"
              />
              <Paper
                className={`p-3 ${
                  message.sender_id === currentUser.id
                    ? 'bg-blue-100'
                    : 'bg-gray-100'
                }`}
              >
                <Typography variant="body2">
                  {message.content}
                </Typography>
                <Typography variant="caption" color="textSecondary" className="mt-1">
                  {new Date(message.created_at).toLocaleTimeString()}
                </Typography>
              </Paper>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            size="small"
          />
          <IconButton
            type="submit"
            color="primary"
            disabled={!newMessage.trim() || sending}
          >
            <SendIcon />
          </IconButton>
        </div>
      </form>
    </div>
  );
} 