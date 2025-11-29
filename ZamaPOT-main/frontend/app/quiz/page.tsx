"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function QuizCategories() {
  const router = useRouter();
  const [showHeader, setShowHeader] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  let lastScrollY = useRef(0);

  const categories = [
    {
      id: "programming",
      title: "Programming",
      description: "JavaScript, Python, Rust, Smart Contracts",
      icon: "💻",
      color: "from-blue-500 to-cyan-500",
      questions: 15,
      time: "30 min"
    },
    {
      id: "web3", 
      title: "Web3 & Blockchain",
      description: "ZK Proofs, FHE, Cryptography, DeFi",
      icon: "🔗",
      color: "from-purple-500 to-pink-500",
      questions: 12,
      time: "25 min"
    },
    {
      id: "fhe",
      title: "FHE Fundamentals",
      description: "Fully Homomorphic Encryption Concepts",
      icon: "🔒",
      color: "from-green-500 to-teal-500",
      questions: 10,
      time: "20 min"
    },
    {
      id: "smart-contracts",
      title: "Smart Contracts",
      description: "Solidity, Security, Deployments",
      icon: "📜",
      color: "from-orange-500 to-red-500",
      questions: 8,
      time: "15 min"
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

  const handleCategorySelect = (categoryId: string) => {
    router.push(`/quiz/${categoryId}`);
  };

  const handleHomeClick = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#02030A]">
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

      <div className="pt-32 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Choose Your <span className="gradient-text">Assessment</span>
            </h1>
            <p className="text-xl text-[#8D8F98] max-w-2xl mx-auto">
              Select a skill category to begin your private verification. All assessments use FHE encryption for complete privacy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className="bg-[#111421] border border-[#3A5BFF]/20 rounded-3xl p-8 neon-glow hover-glow transition-all duration-300 cursor-pointer group hover:scale-105"
              >
                <div className="flex items-start space-x-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-3xl">{category.icon}</span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {category.title}
                    </h3>
                    <p className="text-[#8D8F98] mb-4 leading-relaxed">
                      {category.description}
                    </p>
                    
                    <div className="flex items-center space-x-6 mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-[#4C63FF] text-sm">📝</span>
                        <span className="text-white text-sm">{category.questions} questions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[#4C63FF] text-sm">⏱️</span>
                        <span className="text-white text-sm">{category.time}</span>
                      </div>
                    </div>
                    
                    <button className="px-6 py-3 bg-gradient-to-r from-[#4C63FF] to-[#7DA5FF] text-white rounded-xl font-semibold text-sm hover-glow transition-all duration-300 transform hover:scale-105">
                      Start Assessment →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 bg-[#111421] border border-[#3A5BFF]/20 rounded-3xl p-8 neon-glow">
            <div className="grid md:grid-cols-4 gap-6 text-center">
              {[
                { icon: "🔒", text: "FHE Encrypted", subtext: "Zero data exposure" },
                { icon: "⚡", text: "Quick Assessment", subtext: "15-30 minutes" }, 
                { icon: "📜", text: "NFT Certificate", subtext: "On-chain proof" },
                { icon: "🛡️", text: "Anti-Cheating", subtext: "Behavior analysis" }
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-[#0C0F1A] border border-[#3A5BFF]/20 rounded-xl flex items-center justify-center mb-3 neon-glow">
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <span className="text-white font-semibold mb-1">{item.text}</span>
                  <span className="text-[#8D8F98] text-xs">{item.subtext}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
