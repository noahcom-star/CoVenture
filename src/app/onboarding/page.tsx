'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { OnboardingData } from '@/types/profile';
import Step1BasicInfo from '@/components/onboarding/Step1BasicInfo';
import Step2Skills from '@/components/onboarding/Step2Skills';
import Step3Projects from '@/components/onboarding/Step3Projects';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    step1: {
      full_name: '',
      bio: '',
    },
    step2: {
      skills: [],
      interests: [],
    },
    step3: {
      project_status: 'looking',
    },
  });

  const handleStep1Complete = (data: OnboardingData['step1']) => {
    setOnboardingData(prev => ({ ...prev, step1: data }));
    setCurrentStep(2);
  };

  const handleStep2Complete = (data: OnboardingData['step2']) => {
    setOnboardingData(prev => ({ ...prev, step2: data }));
    setCurrentStep(3);
  };

  const handleStep3Complete = async (data: OnboardingData['step3']) => {
    setOnboardingData(prev => ({ ...prev, step3: data }));
    
    try {
      if (!user) throw new Error('No user found');

      // Create the user profile in Supabase
      const { error } = await supabase.from('profiles').insert({
        user_id: user.id,
        full_name: onboardingData.step1.full_name,
        bio: onboardingData.step1.bio,
        avatar_url: onboardingData.step1.avatar_url,
        skills: onboardingData.step2.skills,
        interests: onboardingData.step2.interests,
        linkedin_url: data.linkedin_url,
        portfolio_url: data.portfolio_url,
        project_status: data.project_status,
        project_idea: data.project_idea,
      });

      if (error) throw error;

      // Redirect to dashboard after successful profile creation
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating profile:', error);
      // TODO: Show error message to user
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  return (
    <div className="min-h-screen bg-[var(--navy-dark)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3].map((step) => (
              <span
                key={step}
                className={`text-sm ${
                  step === currentStep
                    ? 'text-[var(--accent)]'
                    : step < currentStep
                    ? 'text-[var(--white)]'
                    : 'text-[var(--slate)]'
                }`}
              >
                Step {step}
              </span>
            ))}
          </div>
          <div className="h-2 bg-[var(--navy-light)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl shadow-xl p-6">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <Step1BasicInfo
                key="step1"
                data={onboardingData.step1}
                onNext={handleStep1Complete}
              />
            )}
            {currentStep === 2 && (
              <Step2Skills
                key="step2"
                data={onboardingData.step2}
                onNext={handleStep2Complete}
                onBack={handleBack}
              />
            )}
            {currentStep === 3 && (
              <Step3Projects
                key="step3"
                data={onboardingData.step3}
                onNext={handleStep3Complete}
                onBack={handleBack}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 