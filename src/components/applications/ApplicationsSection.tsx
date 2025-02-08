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
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { Tab } from '@headlessui/react';

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
        }
      }

      toast.success(`Application ${status}`);
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
                          {application.projects?.title}
                        </h3>
                        <p className="text-[var(--slate)] mt-1">
                          {application.projects?.description}
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
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4" />
                        <span>Applied {new Date(application.created_at).toLocaleDateString()}</span>
                      </div>
                      {application.projects?.creator && (
                        <div className="flex items-center gap-2">
                          {application.projects.creator.avatar_url ? (
                            <img
                              src={application.projects.creator.avatar_url}
                              alt={application.projects.creator.full_name}
                              className="w-4 h-4 rounded-full"
                            />
                          ) : (
                            <UserCircleIcon className="w-4 h-4" />
                          )}
                          <span>Created by {application.projects.creator.full_name}</span>
                        </div>
                      )}
                      {application.linkedin_url && (
                        <a
                          href={application.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--accent)] hover:underline"
                        >
                          LinkedIn Profile
                        </a>
                      )}
                      {application.github_url && (
                        <a
                          href={application.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--accent)] hover:underline"
                        >
                          GitHub Profile
                        </a>
                      )}
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
                          {application.projects?.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2">
                          {application.profiles?.avatar_url ? (
                            <img
                              src={application.profiles.avatar_url}
                              alt={application.profiles.full_name}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                              <UserCircleIcon className="w-5 h-5 text-[var(--accent)]" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-[var(--white)]">
                              {application.profiles?.full_name}
                            </p>
                            <p className="text-sm text-[var(--slate)]">
                              Applied {new Date(application.created_at).toLocaleDateString()}
                            </p>
                          </div>
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

                    {application.profiles?.skills && application.profiles.skills.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-[var(--light-slate)] mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {application.profiles.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-[var(--accent)]/10 text-[var(--accent)] rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm">
                      {application.linkedin_url && (
                        <a
                          href={application.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--accent)] hover:underline"
                        >
                          LinkedIn Profile
                        </a>
                      )}
                      {application.github_url && (
                        <a
                          href={application.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--accent)] hover:underline"
                        >
                          GitHub Profile
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

                    {application.status === 'pending' && (
                      <div className="flex gap-4 mt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleUpdateStatus(application.id, 'accepted')}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"
                        >
                          <CheckIcon className="w-5 h-5" />
                          <span>Accept</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleUpdateStatus(application.id, 'rejected')}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          <XMarkIcon className="w-5 h-5" />
                          <span>Reject</span>
                        </motion.button>
                      </div>
                    )}
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