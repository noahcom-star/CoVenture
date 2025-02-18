import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserProfile, ProjectApplication } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import {
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Tab } from '@headlessui/react';
import ChatButton from '@/components/chat/ChatButton';

interface ApplicationsSectionProps {
  currentUser: UserProfile;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ApplicationsSection({ currentUser }: ApplicationsSectionProps) {
  const [sentApplications, setSentApplications] = useState<ProjectApplication[]>([]);
  const [receivedApplications, setReceivedApplications] = useState<ProjectApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();

    // Set up real-time subscription
    const applicationsSubscription = supabase
      .channel('applications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_applications'
        },
        () => {
          console.log('Application change detected, refreshing...');
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      applicationsSubscription.unsubscribe();
    };
  }, [currentUser]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      console.log('Fetching applications for user:', currentUser.user_id);

      // Fetch sent applications
      const { data: sentData, error: sentError } = await supabase
        .from('project_applications')
        .select(`
          *,
          projects:project_id (*)
        `)
        .eq('applicant_id', currentUser.user_id)
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;

      // For each sent application, fetch the project creator's profile
      if (sentData) {
        const sentWithCreators = await Promise.all(
          sentData.map(async (app) => {
            if (app.projects) {
              const { data: creatorData } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', app.projects.creator_id)
                .single();
              
              return {
                ...app,
                projects: {
                  ...app.projects,
                  creator: creatorData
                }
              };
            }
            return app;
          })
        );
        console.log('Sent applications:', sentWithCreators);
        setSentApplications(sentWithCreators);
      }

      // Fetch received applications
      const { data: userProjects } = await supabase
        .from('projects')
        .select('id')
        .eq('creator_id', currentUser.user_id);

      if (userProjects && userProjects.length > 0) {
        const { data: receivedData, error: receivedError } = await supabase
          .from('project_applications')
          .select(`
            *,
            projects:project_id (*)
          `)
          .in('project_id', userProjects.map(p => p.id))
          .order('created_at', { ascending: false });

        if (receivedError) throw receivedError;

        // For each received application, fetch the applicant's profile
        if (receivedData) {
          const receivedWithProfiles = await Promise.all(
            receivedData.map(async (app) => {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', app.applicant_id)
                .single();
              
              return {
                ...app,
                profiles: profileData
              };
            })
          );
          console.log('Received applications:', receivedWithProfiles);
          setReceivedApplications(receivedWithProfiles);
        }
      } else {
        setReceivedApplications([]);
      }
    } catch (error) {
      console.error('Error in fetchApplications:', error);
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
        const application = receivedApplications.find(app => app.id === applicationId);
        if (application) {
          const { error: memberError } = await supabase
            .from('project_members')
            .insert({
              project_id: application.project_id,
              user_id: application.applicant_id,
              role: 'member'
            });

          if (memberError) throw memberError;
          
          // Show success message with chat prompt
          toast.success(
            <div>
              <p>Application accepted! 🎉</p>
              <p className="text-sm mt-1">Click the chat button to discuss project details</p>
            </div>
          );
        }
      } else {
        toast.success(`Application ${status}`);
      }
      
      await fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tab.Group>
        <Tab.List className="flex space-x-4 bg-[var(--navy-light)]/30 p-1 rounded-lg">
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full py-2 px-4 text-sm font-medium rounded-md',
                'focus:outline-none',
                selected
                  ? 'bg-[var(--accent)] text-[var(--navy-dark)]'
                  : 'text-[var(--slate)] hover:text-[var(--white)] hover:bg-[var(--accent)]/10'
              )
            }
          >
            Sent Applications ({sentApplications.length})
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full py-2 px-4 text-sm font-medium rounded-md',
                'focus:outline-none',
                selected
                  ? 'bg-[var(--accent)] text-[var(--navy-dark)]'
                  : 'text-[var(--slate)] hover:text-[var(--white)] hover:bg-[var(--accent)]/10'
              )
            }
          >
            Received Applications ({receivedApplications.length})
          </Tab>
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>
            <div className="space-y-4">
              {sentApplications.length === 0 ? (
                <div className="text-center py-8 text-[var(--slate)]">
                  <p>You haven't sent any applications yet.</p>
                </div>
              ) : (
                sentApplications.map((application) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[var(--navy-light)]/30 rounded-lg p-6 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--white)]">
                          {application.project?.title}
                        </h3>
                        <p className="text-[var(--slate)] mt-1">
                          {application.project?.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {application.project?.required_skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center space-x-4 mt-4 text-sm text-[var(--slate)]">
                          <span className="flex items-center space-x-1">
                            <UserGroupIcon className="w-4 h-4" />
                            <span>{application.project?.team_size} members</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>{application.project?.timeline}</span>
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        application.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        application.status === 'accepted' ? 'bg-green-500/10 text-green-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[var(--navy-dark)]">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                          <UserCircleIcon className="w-5 h-5 text-[var(--accent)]" />
                        </div>
                        <div>
                          <p className="text-[var(--white)] font-medium">
                            {application.project?.creator?.full_name}
                          </p>
                          <p className="text-[var(--slate)] text-sm">Project Creator</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-[var(--slate)] text-sm">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {new Date(application.created_at).toLocaleDateString()}
                        </div>
                        {application.project?.creator && (
                          <div className="flex items-center">
                            <ChatButton
                              currentUser={currentUser}
                              otherUser={application.project.creator}
                              projectId={application.project_id}
                              applicationId={application.id}
                              projectTitle={application.project.title || ''}
                            />
                            {application.status === 'accepted' && (
                              <span className="ml-2 text-sm text-[var(--accent)]">
                                Discuss project details
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </Tab.Panel>

          <Tab.Panel>
            <div className="space-y-4">
              {receivedApplications.length === 0 ? (
                <div className="text-center py-8 text-[var(--slate)]">
                  <p>You haven't received any applications yet.</p>
                </div>
              ) : (
                receivedApplications.map((application) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[var(--navy-light)]/30 rounded-lg p-6 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--white)]">
                          {application.project?.title}
                        </h3>
                        <p className="text-[var(--slate)] mt-1">
                          Application from {application.profiles?.full_name}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        application.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        application.status === 'accepted' ? 'bg-green-500/10 text-green-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-[var(--slate)]">
                      {application.linkedin_url && (
                        <a
                          href={application.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--accent)] hover:underline"
                        >
                          LinkedIn
                        </a>
                      )}
                      {application.github_url && (
                        <a
                          href={application.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--accent)] hover:underline"
                        >
                          GitHub
                        </a>
                      )}
                      {application.portfolio_url && (
                        <a
                          href={application.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--accent)] hover:underline"
                        >
                          Portfolio
                        </a>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[var(--navy-dark)]">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                          <UserCircleIcon className="w-5 h-5 text-[var(--accent)]" />
                        </div>
                        <div>
                          <p className="text-[var(--white)] font-medium">
                            {application.profiles?.full_name}
                          </p>
                          <p className="text-[var(--slate)] text-sm">Applicant</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(application.id, 'accepted')}
                              className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
                            >
                              <CheckIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(application.id, 'rejected')}
                              className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {application.profiles && (
                          <div className="flex items-center">
                            <ChatButton
                              currentUser={currentUser}
                              otherUser={application.profiles}
                              projectId={application.project_id}
                              applicationId={application.id}
                              projectTitle={application.project?.title || ''}
                            />
                            {application.status === 'accepted' && (
                              <span className="ml-2 text-sm text-[var(--accent)]">
                                Discuss project details
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
} 