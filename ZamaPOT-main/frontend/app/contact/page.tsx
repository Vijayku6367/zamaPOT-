"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function ContactPage() {
  const router = useRouter();
  const [showHeader, setShowHeader] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  let lastScrollY = useRef(0);

  // Your social links - yahan apni details daal den
  const socialLinks = [
    {
      name: "Email",
      handle: "vijaykumarswami2005@gmail.com",
      url: "vijaykumarswami2005@gmail.com",
      icon: "✉️",
      color: "from-red-500 to-pink-500"
    },
    {
      name: "Twitter", 
      handle: "@vijayeth_",
      url: "https://twitter.com/vijayeth_",
      icon: "🐦",
      color: "from-blue-400 to-cyan-500"
    },
    {
      name: "GitHub",
      handle: "Vijayeth",
      url: "https://github.com/Vijayku6367",
      icon: "💻",
      color: "from-gray-700 to-gray-900"
    },
    {
      name: "LinkedIn",
      handle: "Vijayeth",
      url: "https://www.linkedin.com/in/vijayeth",
      icon: "💼",
      color: "from-blue-600 to-blue-800"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      if (window.scrollY > lastScrollY.current) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      lastScrollY.current = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleHomeClick = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#02030A]">
      {/* Header */}
      <div className={`${showHeader ? "translate-y-0" : "-translate-y-full"} transition-all duration-500 fixed w-full top-0 left-0 z-50`}>
        <header className={`w-full transition-all duration-300 ${isScrolled ? "bg-[#0C0F1A]/90 backdrop-blur-lg border-b border-[#3A5BFF]/20" : "bg-transparent"}`}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={handleHomeClick}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center">
                  <img 
                    src="/logo.png"
                    className="w-10 h-10 object-contain rounded-2xl"
                    alt="logo"
                  />
                </div>
                <span className="text-white font-bold text-xl">ProofOfTalent</span>
              </div>

              <nav className="hidden md:flex items-center space-x-8">
                {["Home", "Why Us", "Platform", "Assessments", "Blog"].map((item) => (
                  <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} className="text-[#C7C9D1] hover:text-white transition-colors duration-200 font-medium text-sm">
                    {item}
                  </a>
                ))}
              </nav>

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

      {/* Main Content */}
      <div className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Get In <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-xl text-[#8D8F98] max-w-2xl mx-auto">
              Have questions about private skill verification? Want to collaborate? 
              Reach out to us through any of these channels.
            </p>
          </div>

          {/* Social Links Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {socialLinks.map((social, index) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#111421] border border-[#3A5BFF]/20 rounded-3xl p-8 neon-glow hover-glow transition-all duration-300 cursor-pointer group hover:scale-105"
              >
                <div className="flex items-center space-x-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${social.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-2xl">{social.icon}</span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {social.name}
                    </h3>
                    <p className="text-[#8D8F98] text-lg">
                      {social.handle}
                    </p>
                    <div className="mt-3">
                      <span className="text-[#4C63FF] text-sm font-semibold">
                        Click to connect →
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Additional Info */}
          <div className="bg-[#111421] border border-[#3A5BFF]/20 rounded-3xl p-8 neon-glow">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Why Choose ProofOfTalent?
              </h2>
              <p className="text-[#8D8F98] mb-6">
                We're building the future of private skill verification using cutting-edge FHE technology. 
                Join us in creating a world where talent can be proven without compromising privacy.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                {[
                  { icon: "🔒", text: "100% Private", desc: "Zero data exposure" },
                  { icon: "⚡", text: "Instant Verification", desc: "Real-time results" },
                  { icon: "🌐", text: "Global Access", desc: "Available worldwide" }
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-[#0C0F1A] border border-[#3A5BFF]/20 rounded-xl flex items-center justify-center mb-3">
                      <span className="text-xl">{item.icon}</span>
                    </div>
                    <span className="text-white font-semibold mb-1">{item.text}</span>
                    <span className="text-[#8D8F98] text-xs">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
