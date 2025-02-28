'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { UserProfile } from '@/types/profile';
import { Tab } from '@headlessui/react';
import Projects from '@/components/projects/Projects';
import ChatSection from '@/components/chat/ChatSection';
import ProjectSwipe from '@/components/projects/ProjectSwipe';
import ProfileDropdown from '@/components/dashboard/ProfileDropdown';
import ApplicationsSection from '@/components/applications/ApplicationsSection';
import { toast } from 'react-hot-toast';
import { FolderIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const tabs = [
  { name: 'Browse', icon: FolderIcon },
  { name: 'Applications', icon: DocumentTextIcon },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      console.log('Fetching profile for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        if (error.code === 'PGRST116') {
          console.log('No profile found, redirecting to onboarding');
          router.push('/onboarding');
          return;
        }
        throw error;
      }

      console.log('Profile fetched successfully:', data);
      setProfile(data);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      toast.error('Failed to fetch profile');
      router.push('/auth');
    } finally {
      setLoading(false);
    }
  }, [user, router]);

  useEffect(() => {
    console.log('Dashboard mount - Auth loading:', authLoading, 'User:', user);
    
    if (authLoading) {
      console.log('Auth is still loading...');
      return;
    }

    if (!user) {
      console.log('No user found after auth load, redirecting to auth');
      router.push('/auth');
      return;
    }

    fetchProfile();
  }, [authLoading, user, fetchProfile, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--navy-dark)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)] mb-4" />
          <p className="text-[var(--slate)]">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--navy-dark)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)] mb-4" />
          <p className="text-[var(--slate)]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[var(--navy-dark)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--white)] mb-4">Profile Not Found</h2>
          <p className="text-[var(--slate)] mb-8">Please complete the onboarding process.</p>
          <button
            onClick={() => router.push('/onboarding')}
            className="px-6 py-3 bg-[var(--accent)] text-[var(--navy-dark)] rounded-lg font-semibold hover:opacity-90 transition-all"
          >
            Complete Onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--navy-dark)]">
      {/* Header */}
      <div className="border-b border-[var(--navy-light)] bg-[var(--navy-dark)]/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/"
              className="text-xl font-bold text-[var(--accent)] hover:opacity-90 transition-opacity"
            >
              CoVenture
            </Link>
            <ProfileDropdown profile={profile} onProfileUpdate={fetchProfile} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-[var(--navy-light)]/50 backdrop-blur-lg p-1">
              {tabs.map((tab) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white/60 ring-offset-2 ring-offset-[var(--navy-dark)] focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-[var(--accent)] text-[var(--navy-dark)]'
                        : 'text-[var(--slate)] hover:bg-[var(--navy-dark)] hover:text-[var(--white)]'
                    )
                  }
                >
                  <div className="flex items-center justify-center space-x-2">
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </div>
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>
                <Projects currentUser={profile} />
              </Tab.Panel>
              <Tab.Panel>
                <ApplicationsSection currentUser={profile} />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
} 

