'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowDownIcon, 
  SparklesIcon, 
  UserGroupIcon, 
  RocketLaunchIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen hero-grid overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--navy-dark)] to-[var(--navy-dark)] pointer-events-none" />
        
        <div className="container mx-auto px-4 pt-32 pb-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block"
            >
              <span className="px-4 py-1 rounded-full text-[var(--accent)] border border-[var(--accent)] text-sm mb-6 inline-block">
                CoVenture
              </span>
            </motion.div>
            
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold text-[var(--white)]">
                Platform for
              </h1>
              <h1 className="text-5xl md:text-7xl font-bold text-gradient">
                Teen Innovators
              </h1>
            </div>

            <div className="h-20 mt-6 mb-8">
              <motion.p
                key={Math.floor(Date.now() / 3000) % 5}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xl md:text-2xl text-[var(--slate)] text-center"
              >
                <TypewriterText
                  phrases={[
                    "Where Ideas Become Reality",
                    "Connect. Create. Change the World.",
                    "Building Tomorrow's Solutions Today",
                    "Your Innovation Journey Starts Here",
                    "Empowering Young Entrepreneurs"
                  ]}
                />
              </motion.p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 rounded-lg bg-[var(--accent)] text-[var(--navy-dark)] font-semibold hover:opacity-90 transition-all"
                >
                  Get Started
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-lg border border-[var(--accent)] text-[var(--accent)] font-semibold hover:bg-[var(--accent)]/10 transition-all"
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce"
          >
            <ArrowDownIcon className="w-6 h-6 text-[var(--accent)]" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[var(--navy-dark)]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--white)]">
                Why Join CoVenture?
              </h2>
              <p className="text-xl text-[var(--slate)] max-w-2xl mx-auto">
                Your launchpad for turning innovative ideas into reality with the perfect team.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: UserGroupIcon,
                  title: "Connect with Co-Founders",
                  description: "Match with like-minded teen entrepreneurs who complement your skills and share your vision."
                },
                {
                  icon: SparklesIcon,
                  title: "Build Your Startup",
                  description: "Get expert guidance and resources to transform your innovative ideas into viable projects."
                },
                {
                  icon: RocketLaunchIcon,
                  title: "Launch & Grow",
                  description: "Access the tools, mentorship, and community support needed to bring your projects to life."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="glass-card p-8 rounded-xl"
                >
                  <feature.icon className="w-12 h-12 text-[var(--accent)] mb-6" />
                  <h3 className="text-xl font-semibold mb-4 text-[var(--white)]">{feature.title}</h3>
                  <p className="text-[var(--slate)]">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Spotlight Section */}
      <section className="py-24 bg-gradient-to-b from-[var(--navy-dark)] to-[var(--navy-light)]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold mb-6 text-[var(--white)]">
                  Built By Teens,<br />
                  <span className="text-[var(--accent)]">For Teens</span>
                </h2>
                <p className="text-lg text-[var(--slate)] mb-8">
                  We understand the unique challenges teen entrepreneurs face. That's why we've created a platform that provides the perfect environment for innovation, collaboration, and growth.
                </p>
                <div className="space-y-4">
                  {[
                    {
                      icon: ChatBubbleLeftRightIcon,
                      title: "Safe & Supportive Community",
                      description: "Connect with peers who share your entrepreneurial spirit"
                    },
                    {
                      icon: LightBulbIcon,
                      title: "Innovation-First Approach",
                      description: "Turn your creative ideas into viable projects"
                    },
                    {
                      icon: AcademicCapIcon,
                      title: "Learn As You Build",
                      description: "Gain real-world experience while creating your startup"
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <item.icon className="w-6 h-6 text-[var(--accent)]" />
                      <div>
                        <h3 className="text-[var(--white)] font-semibold mb-1">{item.title}</h3>
                        <p className="text-[var(--slate)]">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/50 p-1">
                  <div className="w-full h-full rounded-xl bg-[var(--navy-dark)] p-6">
                    {/* Add an image or illustration here */}
                    <div className="w-full h-full rounded-lg bg-[var(--navy-light)]/50 flex items-center justify-center">
                      <span className="text-[var(--accent)]">Platform Preview</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-24 bg-[var(--navy-dark)]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--white)]">
                Success Stories
              </h2>
              <p className="text-xl text-[var(--slate)] max-w-2xl mx-auto">
                See how teen entrepreneurs are building amazing projects on CoVenture.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Chen",
                  project: "EcoTrack",
                  description: "Found the perfect technical co-founder and launched an environmental impact tracking app.",
                  achievement: "Featured in Teen Tech Magazine"
                },
                {
                  name: "Alex Rivera",
                  project: "StudyBuddy AI",
                  description: "Connected with ML experts and built an AI-powered study assistance platform.",
                  achievement: "10,000+ Student Users"
                },
                {
                  name: "Maya Patel",
                  project: "TeenFinance",
                  description: "Assembled a team of 5 and created a financial literacy app for teenagers.",
                  achievement: "Won Youth Startup Award"
                }
              ].map((story, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="glass-card p-8 rounded-xl"
                >
                  <div className="w-16 h-16 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mb-6">
                    <span className="text-2xl text-[var(--accent)]">{story.name[0]}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-[var(--white)]">{story.project}</h3>
                  <p className="text-[var(--slate)] mb-4">{story.description}</p>
                  <div className="flex items-center space-x-2">
                    <SparklesIcon className="w-5 h-5 text-[var(--accent)]" />
                    <span className="text-sm text-[var(--accent)]">{story.achievement}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-[var(--navy-dark)] to-[var(--navy-light)]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--white)]">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-[var(--slate)] mb-12 max-w-2xl mx-auto">
                Join a community of ambitious teen entrepreneurs and turn your ideas into reality.
              </p>
              <Link href="/auth">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 rounded-lg bg-[var(--accent)] text-[var(--navy-dark)] font-semibold text-lg hover:opacity-90 transition-all"
                >
                  Get Started Today
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

function TypewriterText({ phrases }: { phrases: string[] }) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const currentPhrase = phrases[currentPhraseIndex];
    
    if (isDeleting) {
      if (currentText === '') {
        setIsDeleting(false);
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        timeout = setTimeout(() => {}, 500); // Pause before typing next phrase
      } else {
        timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, 50); // Deleting speed
      }
    } else {
      if (currentText === currentPhrase) {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2000); // Wait before starting to delete
      } else {
        timeout = setTimeout(() => {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1));
        }, 100); // Typing speed
      }
    }

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentPhraseIndex, phrases]);

  return (
    <span className="inline-block min-w-[4px]">
      {currentText}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ repeat: Infinity, duration: 1 }}
        className="inline-block w-[4px] h-[1.2em] bg-[var(--accent)] ml-1 align-middle"
      />
    </span>
  );
} 

