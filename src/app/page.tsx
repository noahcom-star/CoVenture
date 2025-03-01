'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowDownIcon, 
  UserGroupIcon, 
  RocketLaunchIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  AcademicCapIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] hero-grid overflow-hidden">
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
              className="mb-8"
            >
              <h1 className="text-6xl md:text-8xl font-bold text-gradient mb-4">
                CoVenture
              </h1>
              <p className="text-2xl md:text-3xl text-[var(--white)] font-light">
                Where Teen Innovators Connect & Build
              </p>
            </motion.div>

            <div className="h-20 mb-8">
              <motion.p
                key={Math.floor(Date.now() / 3000) % 5}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xl md:text-2xl text-[var(--slate)] text-center"
              >
                <TypewriterText
                  phrases={[
                    "Teams With More Than One Founder Outperform Solo Founders by 163%",
                    "Top Business Schools Admit Applicants With Startups/Independent Projects 5x More Than Those With Only Strong Grades",
                    "Connect. Collaborate. Create.",
                    "Turn Ideas into Reality Together",
                    "Join the Next Generation of Builders",
                    "Built for Teens, By Teens"
                  ]}
                />
              </motion.p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/auth">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-gradient"
                >
                  Get Started
                </motion.button>
              </Link>
              <Link href="#how-it-works">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-outline"
                >
                  Learn More
                </motion.button>
              </Link>
            </div>

            <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] overflow-hidden">
              <div className="max-w-[200vw] mx-auto">
                <motion.div
                  className="flex gap-6 py-4 px-8"
                  animate={{
                    x: [0, -1920],
                  }}
                  transition={{
                    x: {
                      duration: 40,
                      repeat: Infinity,
                      ease: "linear",
                      repeatType: "loop"
                    }
                  }}
                >
                  {[
                    {
                      title: "AI-Powered Study Assistant",
                      description: "Helping students learn more effectively"
                    },
                    {
                      title: "Eco-Friendly Delivery Network",
                      description: "Sustainable last-mile delivery solutions"
                    },
                    {
                      title: "Mental Health Platform",
                      description: "Connecting teens with peer support"
                    },
                    {
                      title: "Local Business Marketplace",
                      description: "Supporting youth entrepreneurs"
                    },
                    {
                      title: "Social Impact Gaming",
                      description: "Games that make a difference"
                    },
                    {
                      title: "Educational Content Platform",
                      description: "Peer-to-peer learning network"
                    }
                  ].map((project, i) => (
                    <Link href="/auth" key={i}>
                      <motion.div
                        className="flex-shrink-0 w-[300px] h-[160px] glass-card p-6 rounded-xl relative overflow-hidden group/card cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="absolute inset-0 bg-gradient opacity-0 group-hover/card:opacity-10 transition-opacity" />
                        <h3 className="text-xl font-semibold text-[var(--white)] mb-2">{project.title}</h3>
                        <p className="text-[var(--slate)]">{project.description}</p>
                        <div className="mt-4 flex items-center gap-2 text-[var(--accent)] opacity-0 group-hover/card:opacity-100 transition-opacity">
                          <span className="text-sm font-medium">Sign up to learn more</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                  {/* Duplicate the items to create a seamless loop */}
                  {[
                    {
                      title: "AI-Powered Study Assistant",
                      description: "Helping students learn more effectively"
                    },
                    {
                      title: "Eco-Friendly Delivery Network",
                      description: "Sustainable last-mile delivery solutions"
                    },
                    {
                      title: "Mental Health Platform",
                      description: "Connecting teens with peer support"
                    },
                    {
                      title: "Local Business Marketplace",
                      description: "Supporting youth entrepreneurs"
                    },
                    {
                      title: "Social Impact Gaming",
                      description: "Games that make a difference"
                    },
                    {
                      title: "Educational Content Platform",
                      description: "Peer-to-peer learning network"
                    }
                  ].map((project, i) => (
                    <Link href="/auth" key={`duplicate-${i}`}>
                      <motion.div
                        className="flex-shrink-0 w-[300px] h-[160px] glass-card p-6 rounded-xl relative overflow-hidden group/card cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="absolute inset-0 bg-gradient opacity-0 group-hover/card:opacity-10 transition-opacity" />
                        <h3 className="text-xl font-semibold text-[var(--white)] mb-2">{project.title}</h3>
                        <p className="text-[var(--slate)]">{project.description}</p>
                        <div className="mt-4 flex items-center gap-2 text-[var(--accent)] opacity-0 group-hover/card:opacity-100 transition-opacity">
                          <span className="text-sm font-medium">Sign up to learn more</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </motion.div>
              </div>
              
              {/* Add gradient masks for smooth fade effect */}
              <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[var(--navy-dark)] to-transparent pointer-events-none" />
              <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[var(--navy-dark)] to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-24 bg-[var(--navy-dark)]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--white)] mb-8">
              Building something amazing is better with the right team
            </h2>
            <p className="text-xl text-[var(--slate)] mb-12">
              That's why we created a space for teen innovators to connect.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-card p-6 rounded-xl text-center">
                <h3 className="text-xl font-semibold text-gradient mb-4">Find Your Team</h3>
                <p className="text-[var(--slate)]">
                  Whether you're looking for co-founders, collaborators, or just like-minded peers.
                </p>
              </div>

              <div className="glass-card p-6 rounded-xl text-center">
                <h3 className="text-xl font-semibold text-gradient mb-4">Share Your Vision</h3>
                <p className="text-[var(--slate)]">
                  Have an idea or looking to join one? This is where innovation begins.
                </p>
              </div>

              <div className="glass-card p-6 rounded-xl text-center">
                <h3 className="text-xl font-semibold text-gradient mb-4">Build Together</h3>
                <p className="text-[var(--slate)]">
                  No pressure, no strings attached. Just pure collaboration and growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Work in Teams Section */}
      <section className="py-24 bg-gradient-to-b from-[var(--navy-dark)] to-[var(--navy-light)]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--white)] mb-4">
              Why Work in Teams?
            </h2>
            <p className="text-xl text-[var(--slate)] mb-12">
              The data speaks for itself - teams consistently outperform solo founders
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <a 
                href="https://10years.firstround.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="glass-card p-8 rounded-xl text-center h-full transition-all duration-300 hover:transform hover:scale-[1.02] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  <h3 className="text-2xl font-bold text-[var(--white)] mb-4">163%</h3>
                  <p className="text-[var(--slate)] text-lg mb-6">
                    Teams with multiple founders outperform solo founders by 163%
                  </p>
                  <span className="text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    View Research
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                  <div className="text-[var(--slate)] text-sm mt-4">
                    Source: First Round's 10-Year Project
                  </div>
                </div>
              </a>

              <a 
                href="https://alitamaseb.medium.com/land-of-the-super-founders-a-data-driven-approach-to-uncover-the-secrets-of-billion-dollar-a69ebe3f0f45"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="glass-card p-8 rounded-xl text-center h-full transition-all duration-300 hover:transform hover:scale-[1.02] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  <h3 className="text-2xl font-bold text-[var(--white)] mb-4">2x</h3>
                  <p className="text-[var(--slate)] text-lg mb-6">
                    The odds of building a billion-dollar startup nearly double with 2-3 founders
                  </p>
                  <span className="text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    View Research
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                  <div className="text-[var(--slate)] text-sm mt-4">
                    Source: Ali Tamaseb's Study of 195 Unicorns
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-[var(--navy-dark)] to-[var(--navy-light)]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-[var(--white)] mb-12 text-center">
              How does it work?
            </h2>

            <div className="space-y-12">
              {[
                {
                  step: 1,
                  title: "Create a profile",
                  description: "Tell us about yourself, your skills, and what you're looking for in a co-founder."
                },
                {
                  step: 2,
                  title: "Browse matches",
                  description: "Our matching engine shows you profiles that fit your preferences."
                },
                {
                  step: 3,
                  title: "Connect",
                  description: "If a profile piques your interest, invite them to connect."
                },
                {
                  step: 4,
                  title: "Start building",
                  description: "When they accept your invite, start a conversation and explore possibilities together."
                }
              ].map((item) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-6"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient flex items-center justify-center">
                    <span className="text-[var(--white)] font-bold">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--white)] mb-2">{item.title}</h3>
                    <p className="text-[var(--slate)]">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-[var(--navy-dark)]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-[var(--white)] mb-12 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-8">
              {[
                {
                  question: "Who is this for?",
                  answer: "Anyone who is looking for a co-founder. You can have an idea in mind or just be exploring. You can be already working full-time on a startup or just interested in doing one in the future."
                },
                {
                  question: "Does CoVenture take equity in return for using this?",
                  answer: "No, co-founder matching is a completely free product."
                },
                {
                  question: "I'm not sure if I want to start a startup yet, can I use this to just meet people?",
                  answer: "Absolutely, co-founder matching is a great way to meet other teen entrepreneurs interested in startups."
                },
                {
                  question: "Will my profile be public?",
                  answer: "No, your profile is not public to the internet. Your profile is visible only to other teens who have been approved for co-founder matching."
                }
              ].map((item, index) => (
                <div key={index} className="glass-card p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-[var(--white)] mb-3">{item.question}</h3>
                  <p className="text-[var(--slate)]">{item.answer}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link href="/auth">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-gradient"
                >
                  Sign up now
                </motion.button>
              </Link>
            </div>
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
        className="inline-block w-[1px] h-[1.2em] bg-[var(--white)] ml-[1px] align-middle"
        style={{ 
          verticalAlign: 'middle',
          transform: 'translateY(-1px)'
        }}
      />
    </span>
  );
} 

