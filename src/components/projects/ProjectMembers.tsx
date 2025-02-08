'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import {
  UserGroupIcon,
  CalendarIcon,
  UserCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ProjectMembersProps {
  currentUser: UserProfile;
  projectId: string;
}

interface Project {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  required_skills: string[];
  team_size: number;
  timeline: string;
  status: 'open' | 'in_progress' | 'completed';
  created_at: string;
  creator?: UserProfile;
}

interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'creator' | 'member';
  joined_at: string;
  user?: UserProfile;
}

export default function ProjectMembers({ currentUser, projectId }: ProjectMembersProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectAndMembers();
  }, [projectId]);

  const fetchProjectAndMembers = async () => {
    try {
      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          creator:creator_id (
            id,
            user_id,
            full_name,
            avatar_url
          )
        `)
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Fetch project members
      const { data: membersData, error: membersError } = await supabase
        .from('project_members')
        .select(`
          *,
          user:user_id (
            id,
            user_id,
            full_name,
            avatar_url
          )
        `)
        .eq('project_id', projectId);

      if (membersError) throw membersError;
      setMembers(membersData || []);
    } catch (error) {
      console.error('Error fetching project and members:', error);
      toast.error('Failed to load project members');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Member removed successfully!');
      fetchProjectAndMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl p-6">
        <p className="text-[var(--slate)]">Project not found</p>
      </div>
    );
  }

  const isProjectCreator = project.creator_id === currentUser.user_id;

  return (
    <div className="h-[600px] bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-[var(--white)] mb-2">{project.title}</h3>
        <div className="flex items-center space-x-4 text-sm text-[var(--slate)]">
          <div className="flex items-center space-x-1">
            <UserGroupIcon className="w-4 h-4" />
            <span>{members.length} / {project.team_size} members</span>
          </div>
          <div className="flex items-center space-x-1">
            <CalendarIcon className="w-4 h-4" />
            <span>{project.timeline}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 overflow-y-auto max-h-[calc(100%-8rem)]">
        {members.map((member) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 bg-[var(--navy-dark)]/50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              {member.user?.avatar_url ? (
                <img
                  src={member.user.avatar_url}
                  alt={member.user.full_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                  <UserCircleIcon className="w-6 h-6 text-[var(--accent)]" />
                </div>
              )}
              <div>
                <h4 className="font-medium text-[var(--white)]">{member.user?.full_name}</h4>
                <p className="text-sm text-[var(--slate)]">
                  {member.role === 'creator' ? 'Project Creator' : 'Team Member'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-[var(--slate)]">
                Joined {new Date(member.joined_at).toLocaleDateString()}
              </span>
              {isProjectCreator && member.role !== 'creator' && (
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Remove member"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>
        ))}

        {members.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-[var(--slate)] mb-2">No team members yet</p>
            <p className="text-sm text-[var(--slate)]">
              {project.status === 'open'
                ? 'Wait for applications or invite members to join your project'
                : 'This project has no team members'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 