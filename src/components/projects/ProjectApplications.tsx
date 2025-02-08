'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import {
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Avatar, Button, Card, Dialog, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import { Check as CheckIconMUI, Close as CloseIconMUI, Chat as ChatIconMUI } from '@mui/icons-material';
import Chat from './Chat';
import { ProjectApplication } from '@/types/profile';

interface ProjectApplicationsProps {
  projectId: string;
  currentUser: UserProfile;
}

export default function ProjectApplications({ projectId, currentUser }: ProjectApplicationsProps) {
  const [applications, setApplications] = useState<ProjectApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<ProjectApplication | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    fetchApplications();

    const applicationsSubscription = supabase
      .channel('project_applications_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_applications',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      applicationsSubscription.unsubscribe();
    };
  }, [projectId]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('project_applications')
        .select(`
          *,
          applicant:applicant_id (
            id,
            user_id,
            full_name,
            avatar_url,
            skills,
            interests
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('project_applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) throw error;

      if (status === 'accepted') {
        // Add the applicant as a project member
        const application = applications.find(app => app.id === applicationId);
        if (application) {
          const { error: memberError } = await supabase
            .from('project_members')
            .insert({
              project_id: projectId,
              user_id: application.applicant_id,
              role: 'member'
            });

          if (memberError) throw memberError;
        }
      }

      toast.success(`Application ${status}`);
      await fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    }
  };

  const handleOpenChat = (application: ProjectApplication) => {
    setSelectedApplication(application);
    setShowChatModal(true);
  };

  if (loading) {
    return <div>Loading applications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Typography variant="h6" component="h2">
          Project Applications ({applications.length})
        </Typography>
        <div className="flex gap-2 text-sm">
          <span className="text-yellow-500">⏳ Pending: {applications.filter(a => a.status === 'pending').length}</span>
          <span className="text-green-500">✓ Accepted: {applications.filter(a => a.status === 'accepted').length}</span>
          <span className="text-red-500">✗ Rejected: {applications.filter(a => a.status === 'rejected').length}</span>
        </div>
      </div>

      {['pending', 'accepted', 'rejected'].map((status) => {
        const filteredApplications = applications.filter(a => a.status === status);
        if (filteredApplications.length === 0) return null;
        
        return (
          <div key={status} className="space-y-4">
            <Typography variant="subtitle1" className="capitalize font-medium">
              {status} Applications
            </Typography>
            <List>
              {filteredApplications.map((application) => (
                <Card key={application.id} className="mb-4 border-l-4 border-l-solid" style={{
                  borderLeftColor: status === 'pending' ? '#EAB308' : 
                                  status === 'accepted' ? '#22C55E' : '#EF4444'
                }}>
                  <ListItem
                    secondaryAction={
                      application.status === 'pending' && (
                        <div className="space-x-2">
                          <IconButton
                            edge="end"
                            aria-label="accept"
                            onClick={() => handleUpdateStatus(application.id, 'accepted')}
                            className="text-green-600 hover:bg-green-50"
                          >
                            <CheckIconMUI />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="reject"
                            onClick={() => handleUpdateStatus(application.id, 'rejected')}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <CloseIconMUI />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="chat"
                            onClick={() => handleOpenChat(application)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <ChatIconMUI />
                          </IconButton>
                        </div>
                      )
                    }
                  >
                    <ListItemAvatar>
                      <Avatar src={application.profiles?.avatar_url} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <div className="flex items-center gap-2">
                          <span>{application.profiles?.full_name}</span>
                          <span className="text-xs text-[var(--slate)]">
                            • Applied {new Date(application.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      }
                      secondary={
                        <div className="space-y-2 mt-2">
                          <div className="flex flex-wrap gap-4">
                            {application.profiles?.skills?.map((skill, index) => (
                              <span key={index} className="text-sm text-[var(--slate)]">
                                • {skill}
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-4 mt-2">
                            {application.linkedin_url && (
                              <a href={application.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                LinkedIn Profile
                              </a>
                            )}
                            {application.github_url && (
                              <a href={application.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                GitHub Profile
                              </a>
                            )}
                            {application.portfolio_url && (
                              <a href={application.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                Portfolio
                              </a>
                            )}
                          </div>
                        </div>
                      }
                    />
                  </ListItem>
                </Card>
              ))}
            </List>
          </div>
        );
      })}
      
      {applications.length === 0 && (
        <div className="text-center py-8">
          <Typography color="textSecondary">
            No applications received yet
          </Typography>
        </div>
      )}

      <Dialog
        open={showChatModal}
        onClose={() => setShowChatModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Chat with {selectedApplication?.profiles?.full_name}
        </DialogTitle>
        <DialogContent>
          {selectedApplication && selectedApplication.profiles && (
            <Chat
              projectId={projectId}
              applicationId={selectedApplication.id}
              currentUser={currentUser}
              otherUser={selectedApplication.profiles}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 