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
      <section className="relative min-h-screen hero-grid overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--navy-dark)] to-[var(--navy-dark)] pointer-events-none" />
        
        <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
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
                >
              <h1 className="text-4xl md:text-7xl font-bold text-gradient mb-6 leading-tight">
                    How Ambitious Teens Build Great Startups
                  </h1>
              <p className="text-lg md:text-xl text-[var(--slate)] font-light leading-relaxed mb-8 max-w-3xl mx-auto">
                <TypewriterText 
                  phrases={[
                    "Entrepreneurial teens don't have degrees or networks—just what we build. Some launch startups, others use projects to land internships and admissions. CoVenture is where both happen."
                  ]} 
                />
                  </p>

                  {/* CTA Section */}
              <div className="flex flex-col items-center gap-4">
                    <Link href="/auth" className="w-full max-w-md">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full btn-gradient py-4 text-lg font-medium"
                      >
                        Find Your Team
                      </motion.button>
                    </Link>
                    <p className="text-[var(--slate)] text-sm">
                      Free forever. We know how it is as a broke teenager.
                    </p>
                  </div>
            </motion.div>

            {/* Visual - Project Showcase */}
            <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] overflow-hidden mt-12 mb-8">
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

      {/* Why CoVenture Section */}
      <section className="pt-24 pb-32 bg-[var(--navy-dark)]">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-200px" }}
              className="text-center mb-20"
            >
              <div className="pt-8">
                <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-8">
              Why CoVenture?
            </h2>
                <p className="text-xl text-[var(--slate)] max-w-2xl mx-auto">
                  Build your future through real projects, not just grades
                </p>
              </div>
            </motion.div>

            {/* Outlier Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-20"
            >
              <div className="glass-card p-10 rounded-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient opacity-5" />
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1 space-y-6">
                      <h3 className="text-3xl font-bold text-[var(--white)] mb-6">
                        You Need to Be an <span className="text-gradient">Outlier</span>
                      </h3>
                      <p className="text-lg text-[var(--slate)] leading-relaxed mb-4">
                        It's competitive now. As a teenager, you don't have a fancy university degree, let alone a high school diploma, to establish your credibility and skillset, but more importantly, your network and experience.
                      </p>
                      <p className="text-lg text-[var(--slate)] leading-relaxed mb-4">
                        Whether it be applying to internships, mentorships, or trying to stand out in university applications, you need to be an outlier in order to receive those special opportunities.
                      </p>
                      <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-6 border border-[rgba(255,255,255,0.1)]">
                        <p className="text-lg text-[var(--slate)] leading-relaxed italic">
                          "As a teenager, you can't just get employed out of nowhere and kick off your career. You won't be handed an internship, you won't be gifted admission to Stanford, and you won't build the next unicorn magically over night (maybe on CoVenture, but that's another story)."
                        </p>
                        <p className="text-xl text-[var(--white)] font-semibold mt-4">
                          If you want to achieve these things, you need to build and create endlessly. Become that outlier. Become uncoventional. Build.
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-full md:w-1/3">
                      <div className="aspect-square rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[#9f5afd] p-1">
                        <div className="w-full h-full rounded-2xl bg-[var(--navy-dark)] flex items-center justify-center">
                          <SparklesIcon className="w-24 h-24 text-[var(--accent)]" />
                      </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Main Features Grid */}
            <div className="mb-16">
              <div className="grid md:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="glass-card p-8 rounded-xl relative overflow-hidden group hover:scale-[1.01] transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient opacity-5 group-hover:opacity-10 transition-all duration-300" />
              <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-20 h-20 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
                        <SparklesIcon className="w-12 h-12 text-[var(--accent)]" />
                    </div>
                      <h3 className="text-2xl font-bold text-[var(--white)]">Stand Out</h3>
                    </div>
                    <p className="text-lg text-[var(--slate)] mb-6 leading-relaxed">
                      As a teenager, you won't be handed opportunities. You need to create them through building and shipping real projects.
                    </p>
                    <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-4">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-[var(--accent)]">5x</span>
                        <span className="text-[var(--white)] font-medium">Higher Admission Rate</span>
                  </div>
                      <p className="text-[var(--slate)] text-sm mb-2">
                        Students with independent projects are 5x more likely to be admitted to top universities
                      </p>
                      <a 
                        href="https://www.polygence.org/research-project-impact-on-college-admissions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group/link"
                      >
                        <span className="text-[var(--accent)] text-sm opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                          View Research
                          <motion.svg 
                            className="w-4 h-4" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </motion.svg>
                        </span>
                      </a>
              </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="glass-card p-8 rounded-xl relative overflow-hidden group hover:scale-[1.01] transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient opacity-5 group-hover:opacity-10 transition-all duration-300" />
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-[var(--white)] mb-6">Why Work in Teams?</h3>
                    <div className="space-y-6">
              <a 
                href="https://10years.firstround.com/"
                target="_blank"
                rel="noopener noreferrer"
                        className="block group/link"
                      >
                        <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-4">
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-3xl font-bold text-[var(--accent)]">163%</span>
                            <span className="text-[var(--white)] font-medium">Better Performance</span>
                          </div>
                          <p className="text-[var(--slate)] text-sm mb-2">
                    Teams with multiple founders outperform solo founders by 163%
                  </p>
                          <span className="text-[var(--accent)] text-sm opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                    View Research
                            <motion.svg 
                              className="w-4 h-4" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                              animate={{ x: [0, 4, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </motion.svg>
                  </span>
                </div>
              </a>

              <a 
                href="https://alitamaseb.medium.com/land-of-the-super-founders-a-data-driven-approach-to-uncover-the-secrets-of-billion-dollar-a69ebe3f0f45"
                target="_blank"
                rel="noopener noreferrer"
                        className="block group/link"
                      >
                        <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-4">
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-3xl font-bold text-[var(--accent)]">2x</span>
                            <span className="text-[var(--white)] font-medium">Higher Success Rate</span>
                          </div>
                          <p className="text-[var(--slate)] text-sm mb-2">
                    The odds of building a billion-dollar startup nearly double with 2-3 founders
                  </p>
                          <span className="text-[var(--accent)] text-sm opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                    View Research
                            <motion.svg 
                              className="w-4 h-4" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                              animate={{ x: [0, 4, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </motion.svg>
                  </span>
                </div>
              </a>
            </div>
          </div>
                </motion.div>
              </div>
            </div>

            {/* Common Concerns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h3 className="text-2xl font-bold text-center bg-gradient-to-r from-[var(--accent)] to-[#9f5afd] text-transparent bg-clip-text mb-12">
                Common Concerns
              </h3>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-b from-[var(--accent)]/20 via-[#9f5afd]/20 to-transparent opacity-30 blur-xl" />
                <div className="relative grid md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: LightBulbIcon,
                      title: "No experience?",
                      description: "None needed! This network is for those who want to earn experience and build a startup.",
                      gradient: "from-[var(--accent)] to-[#9f5afd]"
                    },
                    {
                      icon: RocketLaunchIcon,
                      title: "No idea?",
                      description: "Browse innovative world-changing projects and join a team to build it.",
                      gradient: "from-[var(--accent)] to-[#9f5afd]"
                    },
                    {
                      icon: UserGroupIcon,
                      title: "Not sure how to start?",
                      description: "In entrepreneurship, you learn by doing. We'll help you get started.",
                      gradient: "from-[var(--accent)] to-[#9f5afd]"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                      className="group relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/20 to-[#9f5afd]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                      <div className="relative p-8">
                        <div className="mb-6">
                          <div className="relative inline-block">
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] to-[#9f5afd] opacity-20 blur-md rounded-xl" />
                            <div className="relative w-14 h-14 rounded-xl bg-[var(--navy-dark)] border border-[var(--accent)]/30 flex items-center justify-center">
                              <item.icon className="w-8 h-8 text-[var(--accent)]" />
                            </div>
                          </div>
                        </div>
                        <h4 className="text-xl font-semibold text-[var(--white)] group-hover:text-[var(--accent)] transition-colors duration-300 mb-4">
                          {item.title}
                        </h4>
                        <p className="text-[var(--slate)] leading-relaxed">
                          {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="glass-card p-8 rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient opacity-5" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-[var(--white)] mb-4">
                    Ready to Start Building?
              </h3>
                  <p className="text-lg text-[var(--slate)] mb-8 max-w-2xl mx-auto">
                    Join a community of teen innovators and turn your ideas into reality
                  </p>
              <Link href="/auth">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-gradient py-4 px-8 text-lg font-medium"
                >
                      Find Your Team →
                </motion.button>
              </Link>
            </div>
          </div>
            </motion.div>
          </div>
        </div>

        {/* Sticky Mobile CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--navy-dark)]/80 backdrop-blur-sm border-t border-[rgba(255,255,255,0.1)] md:hidden">
          <Link href="/auth" className="block">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-gradient py-4 text-lg font-medium"
            >
              Get Started Now
            </motion.button>
          </Link>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-[var(--navy-dark)]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gradient mb-12 text-center">
              How does it work?
            </h2>

            <div className="relative">
              <div className="absolute left-[21px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-[var(--accent)] via-[#9f5afd] to-transparent" />
              <div className="space-y-16">
              {[
                {
                  step: 1,
                  title: "Create a profile",
                    description: "Tell us about yourself, your skills, you interests, and what type of projects you might have in mind."
                },
                {
                  step: 2,
                    title: "Browse / create projects",
                    description: "Create a project and find people with compatable skillsets! Or browse projects created by other teens that appeal to your skillsets!"
                },
                {
                  step: 3,
                    title: "Apply / Accept",
                    description: "If a project piques your interest and aligns with your skills, apply and message the project creator! If you're a project creator, you can accept or reject applicants based on their fit, application, and message."
                },
                {
                  step: 4,
                    title: "Start building the future",
                    description: "When they / you accept the invite, start building!"
                }
              ].map((item) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                    className="flex items-start gap-6 group"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] to-[#9f5afd] opacity-20 blur-lg rounded-full" />
                      <div className="relative flex-shrink-0 w-11 h-11 rounded-full bg-[var(--navy-dark)] border-2 border-[var(--accent)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="text-[var(--accent)] font-bold">{item.step}</span>
                      </div>
                  </div>
                    <div className="pt-1">
                      <h3 className="text-xl font-semibold text-[var(--white)] mb-2 group-hover:text-[var(--accent)] transition-colors duration-300">{item.title}</h3>
                    <p className="text-[var(--slate)]">{item.description}</p>
                  </div>
                </motion.div>
              ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-[var(--navy-dark)]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gradient mb-12 text-center">
              Frequently Asked Questions
                </h2>

            {/* FAQ Component */}
            <div className="space-y-6">
              {[
                {
                  question: "Who is this for?",
                  answer: "Anyone who is an ambitious teenager eager to build with others. You can have an idea in mind or just be exploring. You can be already working on something or just interested in a certain field wanting to learn more through action."
                },
                {
                  question: "Does CoVenture take equity in return for using this?",
                  answer: "No, if you build something great, we'll be proud to say we were part of it. We won't take any equity in return for using this platform."
                },
                {
                  question: "I'm not sure if I want to build something yet, can I use this to just check out different ideas?",
                  answer: "Absolutely, CoVenture is a great way to meet other teen entrepreneurs interested in likeminded fields."
                },
                {
                  question: "Who do I contact for help or suggestions?",
                  answer: "Contact me! I love meeting with users and helping them build. Reach out to me at noah@barbaros.ca"
                }
              ].map((item, index) => {
                const [isOpen, setIsOpen] = useState(false);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="glass-card p-6 rounded-xl relative overflow-hidden group hover:scale-[1.01] transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-[#9f5afd]/5 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="relative z-10">
                      <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full text-left flex justify-between items-center"
                      >
                        <h3 className="text-xl font-semibold text-[var(--white)] group-hover:text-[var(--accent)] transition-colors duration-300">
                          {item.question}
                        </h3>
                        <motion.div 
                          className="w-6 h-6 flex items-center justify-center"
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <svg className="w-4 h-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </motion.div>
                      </button>
                      
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="text-[var(--slate)] leading-relaxed">
                              {item.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
                </div>

            <div className="mt-12 text-center">
              <Link href="/auth">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-gradient py-4 px-8 text-lg font-medium"
                >
                  Sign up now
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Founder's Note */}
      <section className="py-24 bg-[var(--navy-dark)]">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Background gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 to-[#9f5afd]/10 opacity-50 blur-3xl" />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-start gap-16">
                  {/* Profile Section */}
                  <div className="w-full md:w-1/3 flex flex-col items-center text-center space-y-6">
                    <div className="w-48 h-48 rounded-full overflow-hidden bg-gradient-to-br from-[var(--accent)] to-[#9f5afd] p-[3px]">
                      <div className="w-full h-full rounded-full overflow-hidden">
                        <img
                          src="/noah-photo.jpg"
                          alt="Noah"
                          className="w-full h-full object-cover scale-150 object-[50%_40%]"
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[var(--white)]">Noah Barbaros</h3>
                      <p className="text-[var(--slate)]">Teen Builder 🧑‍💻, CoVenture</p>
                    </div>
                    <div className="space-y-4 w-full">
                      <a 
                        href="https://mail.google.com/mail/?view=cm&fs=1&to=noah@barbaros.ca"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-3 px-6 rounded-lg border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors duration-300"
                      >
                        Contact Me 👋
                      </a>
                      <p className="text-sm text-[var(--slate)]">
                        I love chatting with teen builders! Reach out with any questions, feedback, or just to connect.
                      </p>
                    </div>
                  </div>

                  {/* Message Section */}
                  <div className="flex-1 space-y-8">
                    <h2 className="text-4xl font-bold text-gradient">
                      Hey! I'm Noah 👋
                    </h2>
                    <div className="space-y-6 text-lg">
                      <p className="text-[var(--slate)] leading-relaxed">
                        Like many of you, I started my journey in tech and entrepreneurship as a teenager. I chased internships and opportunities but had nothing to show—so I started building. I fell in love with it. But finding others my age who shared that passion? Embarrassingly difficult haha.
                      </p>
                      <p className="text-[var(--slate)] leading-relaxed">
                        Traditional networking spaces weren't designed for us - they honestly suck in my opinion. LinkedIn is this over glorified online resume database where every connection feels like an empty handshake. We don't need corporate networking. We need a place to build. That's why I created CoVenture.
                      </p>
                      <p className="text-[var(--slate)] leading-relaxed">
                        This platform is built for ambitious teens like us—a space to connect, share ideas, and create.
                      </p>
                      <p className="text-[var(--slate)] leading-relaxed">
                        Every great company started with a small, determined team. I believe the next world-changing ideas will come from us. Let's make it happen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-[var(--navy-dark)]">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[var(--white)] mb-6">
              Ready to Start Building?
              </h2>
            <p className="text-[var(--slate)] mb-8">
              Join the most ambitious teenagers already building and create amazing projects together.
              </p>
              <Link href="/auth">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                className="btn-gradient py-4 px-8 text-lg font-medium"
                >
                Get Started Now
                </motion.button>
              </Link>
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

