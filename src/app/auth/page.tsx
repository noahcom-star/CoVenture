'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="min-h-screen bg-[var(--navy-dark)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gradient">
            {isSignIn ? 'Welcome Back!' : 'Create Your Account'}
          </h2>
          <p className="mt-2 text-[var(--slate)]">
            {isSignIn
              ? 'Sign in to continue your journey'
              : 'Join the community of teen entrepreneurs'}
          </p>
        </div>

        <div className="bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden">
          <div className="flex mb-6">
            <button
              onClick={() => setIsSignIn(true)}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                isSignIn
                  ? 'text-[var(--white)] bg-gradient'
                  : 'text-[var(--slate)] hover:text-[var(--light-slate)]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignIn(false)}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                !isSignIn
                  ? 'text-[var(--white)] bg-gradient'
                  : 'text-[var(--slate)] hover:text-[var(--light-slate)]'
              }`}
            >
              Sign Up
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isSignIn ? 'signin' : 'signup'}
              initial={{ opacity: 0, x: isSignIn ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isSignIn ? 20 : -20 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              {isSignIn ? <SignInForm /> : <SignUpForm />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 