'use client';

import { motion } from 'framer-motion';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[var(--navy-dark)] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl p-10 text-center space-y-8"
      >
        <div className="w-20 h-20 bg-[var(--accent)]/10 rounded-full flex items-center justify-center mx-auto">
          <EnvelopeIcon className="w-10 h-10 text-[var(--accent)]" />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-[var(--white)]">
            Check Your Email
          </h1>

          <p className="text-[var(--slate)] text-lg">
            We've sent you a verification link to your email address. Please click the link to verify your account and get started.
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-6 glass-card relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient opacity-0 group-hover:opacity-10 transition-opacity" />
            <p className="text-base text-[var(--white)]">
              Don't forget to check your spam folder if you don't see the email in your inbox!
            </p>
          </div>

          <Link href="/auth" className="block">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-6 bg-transparent text-[var(--white)] rounded-lg font-semibold transition-all border-2 border-transparent bg-clip-padding hover:border-[var(--accent)] relative overflow-hidden"
              style={{
                backgroundImage: 'linear-gradient(var(--navy-dark), var(--navy-dark)), var(--accent)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box'
              }}
            >
              Back to Sign In
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
} 