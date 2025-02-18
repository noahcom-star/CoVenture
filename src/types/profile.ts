import { User } from '@supabase/supabase-js';

export interface UserProfile extends Omit<User, 'created_at' | 'updated_at'> {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  github_url?: string;
  project_status?: string;
  project_idea?: string;
  skills: string[];
  interests: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  required_skills: string[];
  team_size: number;
  timeline: string;
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  creator?: UserProfile;
  project_applications?: ProjectApplication[];
  project_applications_count?: number;
  pending_applications_count?: number;
  accepted_applications_count?: number;
}

export interface ProjectApplication {
  id: string;
  project_id: string;
  applicant_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  profiles?: UserProfile;
  project?: {
    title: string;
    description: string;
    required_skills: string[];
    team_size: number;
    timeline: string;
    creator?: UserProfile;
  };
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'creator' | 'member';
  joined_at: string;
  user?: UserProfile;
}

export interface ChatRoom {
  id: string;
  created_at: string;
  updated_at: string;
  project_id?: string;
  project?: Project;
  members?: UserProfile[];
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: UserProfile;
}

export interface OnboardingData {
  step1: {
    full_name: string;
    avatar_url?: string;
    bio: string;
  };
  step2: {
    skills: string[];
    interests: string[];
  };
  step3: {
    project_status: 'looking' | 'has_idea';
    project_idea?: string;
    linkedin_url?: string;
    portfolio_url?: string;
  };
} 