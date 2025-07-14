import React from 'react';

export default function BecomeCreatorSection({ openModal }) {
  return (
    <section className="text-center py-20 px-4 bg-white">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">✨ Become a Closetly Creator</h2>
      <p className="text-lg text-gray-600 mb-6">Style. Influence. Earn. Turn your closet into a brand.</p>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={openModal}
          className="bg-[#A98977] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Learn More
        </button>

        <a
          href="https://whop.com/checkout/2xDdO3FOlO2dLmvuw1-9n65-i5Jg-VVOi-BJboArC0G9Ff/"
          target="_blank"
          rel="noopener noreferrer"
          className="border-2 border-[#A98977] text-[#A98977] px-6 py-3 rounded-lg font-semibold hover:bg-[#f5f0ed] transition"
        >
          Join Now
        </a>
      </div>

      <p className="text-sm text-gray-500 mt-3">No experience needed — all styles welcome.</p>
    </section>
  );
} 