'use client';

import { motion } from 'framer-motion';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[var(--navy-dark)] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl p-8 text-center"
      >
        <div className="w-16 h-16 bg-[var(--accent)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <EnvelopeIcon className="w-8 h-8 text-[var(--accent)]" />
        </div>

        <h1 className="text-2xl font-bold text-[var(--white)] mb-4">
          Check Your Email
        </h1>

        <p className="text-[var(--slate)] mb-6">
          We've sent you a verification link to your email address. Please click the link to verify your account and get started.
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-[var(--accent)]/10 rounded-lg">
            <p className="text-sm text-[var(--accent)]">
              Don't forget to check your spam folder if you don't see the email in your inbox!
            </p>
          </div>

          <Link href="/auth">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-[var(--accent)] text-[var(--navy-dark)] rounded-lg font-semibold hover:opacity-90 transition-all"
            >
              Back to Sign In
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
} 