'use client';

export default function AssessmentModes() {
  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-center text-lg text-[#AAB4FF] mb-6 tracking-wide">
        Choose Assessment Mode
      </h2>

      <div className="grid grid-cols-3 gap-6">
        
        {/* AI Chip */}
        <div className="p-4 rounded-2xl bg-[#0b0f1a] border border-[#1f3bff40] shadow-[0_0_20px_#1f3bff40]">
          <img src="/images/chip.png" className="w-12 h-12 mx-auto" />
        </div>

        {/* Secure Link */}
        <div className="p-4 rounded-2xl bg-[#0b0f1a] border border-[#34c3ff40] shadow-[0_0_20px_#34c3ff40]">
          <img src="/images/link.png" className="w-12 h-12 mx-auto" />
        </div>

        {/* Analytics */}
        <div className="p-4 rounded-2xl bg-[#0b0f1a] border border-[#8d64ff40] shadow-[0_0_20px_#8d64ff40]">
          <img src="/images/graph.png" className="w-12 h-12 mx-auto" />
        </div>
      </div>
    </div>
  );
}
