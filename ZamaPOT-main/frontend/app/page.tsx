"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import WalletButton from "../components/WalletButton";

export default function PremiumHomepage() {
  const router = useRouter();
  const [showHeader, setShowHeader] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  let lastScrollY = useRef(0);
  
  // Scroll animation ke liye state
  const [visibleSections, setVisibleSections] = useState({
    feature1: false,
    feature2: false, 
    feature3: false
  });

  // Refs for features
  const feature1Ref = useRef(null);
  const feature2Ref = useRef(null);
  const feature3Ref = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // 🔥 Header Show/Hide Logic
      if (window.scrollY > lastScrollY.current) {
        setShowHeader(false);  // scrolling down → hide
      } else {
        setShowHeader(true);   // scrolling up → show
      }
      lastScrollY.current = window.scrollY;

      // Feature visibility code
      const feature1 = feature1Ref.current;
      const feature2 = feature2Ref.current;
      const feature3 = feature3Ref.current;

      if (feature1) {
        const rect = (feature1 as HTMLElement).getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
          setVisibleSections(prev => ({ ...prev, feature1: true }));
        }
      }
      if (feature2) {
        const rect = (feature2 as HTMLElement).getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
          setVisibleSections(prev => ({ ...prev, feature2: true }));
        }
      }
      if (feature3) {
        const rect = (feature3 as HTMLElement).getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
          setVisibleSections(prev => ({ ...prev, feature3: true }));
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#02030A]">

      <div
        className={`${showHeader ? "translate-y-0" : "-translate-y-full"} 
        transition-all duration-500 fixed w-full top-0 left-0 z-50`}
      >

        {/* Wallet Button Header */}
        <header className="flex justify-end p-4 bg-transparent">
          <WalletButton />
        </header>
        {/*MAIN HEADER */}
        <header
          className={`w-full transition-all duration-300 ${
            isScrolled
              ? "bg-[#0C0F1A]/90 backdrop-blur-lg border-b border-[#3A5BFF]/20"
              : "bg-transparent"
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">

              {/* Logo */}
              <div className="flex items-center space-x-3 -mt-5">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center">
                  <img 
                    src="/logo.png"
                    className="w-15 h-15 object-contain rounded-2xl"
                    alt="logo"
                  />
                </div>
                <span className="text-white font-bold text-xl">ProofOfTalent</span>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                {["Home", "Why Us", "Platform", "Assessments", "Blog"].map(
                  (item) => (
                    <a
                      key={item}
                      href={`#${item.toLowerCase().replace(" ", "-")}`}
                      className="text-[#C7C9D1] hover:text-white transition-colors duration-200 font-medium text-sm"
                    >
                      {item}
                    </a>
                  )
                )}
              </nav>

              {/* CTA */}
              <button 
                onClick={() => router.push("/contact")}
                className="px-6 py-2.5 border border-[#3A5BFF]/40 text-[#3A5BFF] rounded-xl hover:bg-[#3A5BFF]/10 transition-all duration-200 font-medium text-sm"
              >
                Contact Us
              </button>              
            </div>
          </div>
        </header>
      </div>          

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 holographic-grid opacity-20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#3A5BFF]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7DA5FF]/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Tagline */}
              <div className="inline-flex items-center space-x-2 bg-[#0C0F1A] border border-[#3A5BFF]/20 rounded-full px-4 py-2 neon-glow mt-5">
                <div className="w-2 h-2 bg-[#4C63FF] rounded-full"></div>
                <span className="text-[#C7C9D1] text-sm font-medium">150+ Skills Verified</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Prove Your{' '}
                <span className="gradient-text">Talent</span>
                <br />
                Without Revealing
                <br />
                Your{' '}
                <span className="gradient-text">Answers</span>
              </h1>

              {/* Subtext */}
              <p className="text-xl text-[#8D8F98] leading-relaxed max-w-2xl">
                Private skill verification using Fully Homomorphic Encryption. 
                Prove your capabilities while keeping your data encrypted and secure.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push("/quiz")}
                  className="px-8 py-4 bg-gradient-to-r from-[#4C63FF] to-[#7DA5FF] text-white rounded-2xl font-semibold text-lg hover-glow transition-all duration-300"
                >
                  Start Assessment →
                </button>
                <button className="px-8 py-4 border border-[#3A5BFF]/40 text-[#3A5BFF] rounded-2xl font-semibold text-lg hover:bg-[#3A5BFF]/10 transition-all duration-300">
                  View Demo
                </button>
              </div>
            </div>

            {/* Right Side - 3D Icons */}
            <div className="relative">
              <div className="relative w-full h-96">
                {/* Holographic Grid Floor */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-80 h-32 bg-gradient-to-t from-[#3A5BFF]/20 to-transparent rounded-full blur-xl"></div>
                
                {/* Floating Icons */}
                <div className="absolute top-1/4 left-1/4 float">
                  <div className="w-20 h-20 bg-[#0C0F1A] border-2 border-[#4C63FF] rounded-2xl neon-glow flex items-center justify-center">
                    <span className="text-2xl">💻</span>
                  </div>
                </div>
                
                <div className="absolute top-1/2 right-1/4 float" style={{ animationDelay: '2s' }}>
                  <div className="w-20 h-20 bg-[#0C0F1A] border-2 border-[#7DA5FF] rounded-2xl neon-glow flex items-center justify-center">
                    <span className="text-2xl">🧮</span>
                  </div>
                </div>
                
                <div className="absolute bottom-1/4 left-1/3 float" style={{ animationDelay: '4s' }}>
                  <div className="w-20 h-20 bg-[#0C0F1A] border-2 border-[#21D4FD] rounded-2xl neon-glow flex items-center justify-center">
                    <span className="text-2xl">🔗</span>
                  </div>
                </div>

                {/* Spotlight Effect */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-gradient-to-b from-[#3A5BFF]/30 to-transparent rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assessment Modes Section */}
      <section className="py-16 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-center text-2xl lg:text-3xl font-bold text-[#AAB4FF] mb-4 tracking-wide">
              Choose Assessment Mode
            </h2>
            <p className="text-center text-[#8D8F98] max-w-2xl">
              Select your preferred assessment method. All modes ensure complete privacy and security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            
            {/* AI Chip - Private Assessment */}
            <div className="p-6 rounded-2xl bg-[#0b0f1a] border border-[#1f3bff40] shadow-[0_0_20px_#1f3bff40] hover:shadow-[0_0_30px_#1f3bff60] transition-all duration-300 cursor-pointer group">
              <div className="w-16 h-16 mx-auto mb-4 text-[#1f3bff]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <path d="M9 9h6v6H9z" />
                  <path d="M12 4v16" />
                  <path d="M4 12h16" />
                </svg>
              </div>
              <h3 className="text-white text-center text-lg font-semibold mb-2">AI Chip</h3>
              <p className="text-[#8D8F98] text-center text-sm">
                Private AI-powered assessment with encrypted evaluation
              </p>
            </div>

            {/* Secure Link - Shareable Assessment */}
            <div className="p-6 rounded-2xl bg-[#0b0f1a] border border-[#34c3ff40] shadow-[0_0_20px_#34c3ff40] hover:shadow-[0_0_30px_#34c3ff60] transition-all duration-300 cursor-pointer group">
              <div className="w-16 h-16 mx-auto mb-4 text-[#34c3ff]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <h3 className="text-white text-center text-lg font-semibold mb-2">Secure Link</h3>
              <p className="text-[#8D8F98] text-center text-sm">
                Generate shareable assessment links with encrypted responses
              </p>
            </div>

            {/* Analytics - Performance Insights */}
            <div className="p-6 rounded-2xl bg-[#0b0f1a] border border-[#8d64ff40] shadow-[0_0_20px_#8d64ff40] hover:shadow-[0_0_30px_#8d64ff60] transition-all duration-300 cursor-pointer group">
              <div className="w-16 h-16 mx-auto mb-4 text-[#8d64ff]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18" />
                  <path d="M7 14l3-3 3 3 4-4" />
                  <path d="M18 8h-4" />
                  <path d="M15 5h4" />
                </svg>
              </div>
              <h3 className="text-white text-center text-lg font-semibold mb-2">Analytics</h3>
              <p className="text-[#8D8F98] text-center text-sm">
                Detailed performance insights with privacy-preserving analytics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bar with Scroll Animations */}
      <section className="py-16 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Feature 1 - Private Assessment */}
            <div 
              ref={feature1Ref}
              className={`bg-[#111421] border border-[#3A5BFF]/20 rounded-3xl p-8 neon-glow hover-glow transition-all duration-700 transform ${
                visibleSections.feature1 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto">
                <img 
                  src="/images/1.png" 
                  alt="Private Assessment" 
                  className="w-12 h-12 rounded-full object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 text-center">Private Assessment</h3>
              <p className="text-[#8D8F98] leading-relaxed text-center">
                Your answers are encrypted before leaving your device. 
                Zero-knowledge verification ensures complete privacy.
              </p>
            </div>

            {/* Feature 2 - Talent NFTs */}
            <div 
              ref={feature2Ref}
              className={`bg-[#111421] border border-[#3A5BFF]/20 rounded-3xl p-8 neon-glow hover-glow transition-all duration-700 transform delay-200 ${
                visibleSections.feature2 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto">
                <img 
                  src="/images/2.png" 
                  alt="Talent NFTs" 
                  className="w-12 h-12 rounded-full object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 text-center">Talent NFTs</h3>
              <p className="text-[#8D8F98] leading-relaxed text-center">
                Mint verifiable talent certificates as NFTs on blockchain. 
                Showcase your proven skills to employers.
              </p>
            </div>

            {/* Feature 3 - Anti-Cheating */}
            <div 
              ref={feature3Ref}
              className={`bg-[#111421] border border-[#3A5BFF]/20 rounded-3xl p-8 neon-glow hover-glow transition-all duration-700 transform delay-400 ${
                visibleSections.feature3 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto">
                <img 
                  src="/images/3.png" 
                  alt="Anti-Cheating" 
                  className="w-12 h-12 rounded-full object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 text-center">Anti-Cheating</h3>
              <p className="text-[#8D8F98] leading-relaxed text-center">
                Advanced behavior analysis and FHE-based consistency checks 
                ensure genuine skill verification.
              </p>
            </div>
            
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-bold text-white">
                Redefining Talent Verification:{' '}
                <span className="gradient-text">Privacy Meets Proof</span>
              </h2>
              <p className="text-lg text-[#8D8F98] leading-relaxed">
                We bridge traditional skill assessment with cutting-edge privacy technology, 
                creating a trustless environment where talent can be verified without compromising data security.
              </p>
              <button className="px-8 py-4 border border-[#3A5BFF] text-[#3A5BFF] rounded-2xl font-semibold text-lg hover:bg-[#3A5BFF]/10 transition-all duration-300">
                Start Your Assessment →
              </button>
            </div>

            {/* Right Content - Feature Grid */}
            <div className="grid grid-cols-2 gap-6">
              {[
                {
                  icon: '🔐',
                  title: 'Encrypted Evaluation',
                  desc: 'FHE processes your answers without decryption'
                },
                {
                  icon: '🎯',
                  title: 'Dynamic Questions',
                  desc: 'Unique assessments for every candidate'
                },
                {
                  icon: '📜',
                  title: 'On-Chain Credentials',
                  desc: 'Immutable talent records on blockchain'
                },
                {
                  icon: '⚡',
                  title: 'Instant Verification',
                  desc: 'Real-time skill validation for employers'
                }
              ].map((feature, index) => (
                <div key={index} className="bg-[#111421] border border-[#3A5BFF]/20 rounded-2xl p-6 neon-glow hover-glow transition-all duration-300 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#4C63FF] to-[#7DA5FF] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-sm">{feature.icon}</span>
                  </div>
                  <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                  <p className="text-[#8D8F98] text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section id="platform" className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Future-Ready Talent Verification Starts Here
            </h2>
            <p className="text-xl text-[#8D8F98] max-w-3xl mx-auto">
              Trusted by forward-thinking organizations, educational institutions, and tech companies worldwide.
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { number: '10K+', label: 'Skills Verified' },
              { number: '150+', label: 'Organizations' },
              { number: '98%', label: 'Accuracy Rate' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl lg:text-6xl font-bold gradient-text mb-4">{stat.number}</div>
                <div className="text-[#8D8F98] text-lg">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Platform Features */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-white">Advanced FHE Infrastructure</h3>
              <p className="text-lg text-[#8D8F98] leading-relaxed">
                Our platform leverages Fully Homomorphic Encryption to process encrypted data, 
                ensuring your answers remain private while enabling accurate skill assessment.
              </p>
              <div className="space-y-4">
                {[
                  'Per-user question randomization',
                  'Behavior-based cheating detection',
                  'Real-time encrypted evaluation',
                  'Blockchain-verified credentials'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#4C63FF] rounded-full"></div>
                    <span className="text-white">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right Side - Bigger Icons with SVG */}
            <div className="relative">
              <div className="bg-[#111421] border border-[#3A5BFF]/20 rounded-3xl p-8 neon-glow">
                <div className="grid grid-cols-2 gap-8">
                  {/* Computer Icon - Bigger */}
                  <div className="w-20 h-20 bg-[#0C0F1A] border border-[#3A5BFF]/20 rounded-2xl flex items-center justify-center neon-glow hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-[#3A5BFF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                      <line x1="8" y1="21" x2="16" y2="21"></line>
                      <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                  </div>

                  {/* Math Icon - Bigger */}
                  <div className="w-20 h-20 bg-[#0C0F1A] border border-[#34c3ff]/20 rounded-2xl flex items-center justify-center neon-glow hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-[#34c3ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 19l16-14M4 5l16 14M12 3v18"></path>
                    </svg>
                  </div>

                  {/* Link Icon - Bigger */}
                  <div className="w-20 h-20 bg-[#0C0F1A] border border-[#8d64ff]/20 rounded-2xl flex items-center justify-center neon-glow hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-[#8d64ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                  </div>

                  {/* Shield Icon - Bigger */}
                  <div className="w-20 h-20 bg-[#0C0F1A] border border-[#21D4FD]/20 rounded-2xl flex items-center justify-center neon-glow hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-[#21D4FD]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-[#0C0F1A] to-[#111421] border border-[#3A5BFF]/20 rounded-3xl p-12 neon-glow">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Prove Your Skills Privately?
            </h2>
            <p className="text-xl text-[#8D8F98] mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who trust our platform for secure, 
              private talent verification.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-[#4C63FF] to-[#7DA5FF] text-white rounded-2xl font-semibold text-lg hover-glow transition-all duration-300 transform hover:scale-105">
                Start Free Assessment
              </button>
              <button className="px-8 py-4 border border-[#3A5BFF]/40 text-[#3A5BFF] rounded-2xl font-semibold text-lg hover:bg-[#3A5BFF]/10 transition-all duration-300">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#3A5BFF]/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-[#4C63FF] to-[#7DA5FF] rounded-xl flex items-center justify-center">
                  <span className="text-white text-sm">🛡️</span>
                </div>
                <span className="text-white font-bold text-lg">ProofOfTalent</span>
              </div>
              <p className="text-[#8D8F98] text-sm">
                Private skill verification powered by FHE and blockchain technology.
              </p>
            </div>
            
            {[
              {
                title: 'Platform',
                links: ['Assessments', 'Talent NFTs', 'Verification', 'API Docs']
              },
              {
                title: 'Company',
                links: ['About', 'Careers', 'Privacy', 'Terms']
              },
              {
                title: 'Support',
                links: ['Help Center', 'Contact', 'Documentation', 'Status']
              }
            ].map((column, index) => (
              <div key={index}>
                <h3 className="text-white font-semibold mb-4">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-[#8D8F98] hover:text-white transition-colors duration-200 text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-[#3A5BFF]/20 mt-8 pt-8 text-center">
            <p className="text-[#8D8F98] text-sm">
              © 2024 ProofOfTalent. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
