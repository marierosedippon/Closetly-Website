"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

const avatarBase = "/img/avatar-base.png";
const blackTop = "/img/black-top.png";
const closetVideo = "/new-closet-intro.mp4"; // Use your new video filename

export default function Home() {
  const [showContent, setShowContent] = useState(false);
  const [videoDone, setVideoDone] = useState(false);
  const [showAndroidWaitlist, setShowAndroidWaitlist] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Optionally, show a spinner or just return null
    return null;
  }

  // Show main content after video ends
  const handleVideoEnd = () => {
    setVideoDone(true);
    setTimeout(() => setShowContent(true), 600); // Smooth fade
  };

  return (
    <main className="flex flex-col min-h-screen bg-white text-black font-sans">
      {/* Closet Video Intro Overlay */}
      {!showContent && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-700 ${videoDone ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <video
            ref={videoRef}
            src={closetVideo}
            autoPlay
            muted
            playsInline
            className="w-full max-w-lg"
            onEnded={handleVideoEnd}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Main Content (appears after video) */}
      <div className={`flex flex-col min-h-screen transition-opacity duration-700 ${showContent ? 'opacity-100' : 'opacity-0 pointer-events-none h-0'}`}>
        {/* Hero Section */}
        <header className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white">
          <h1 className="text-6xl font-extrabold font-serif mb-2">Closetly</h1>
          <h2 className="text-3xl font-semibold mb-2">Your Wardrobe, Reimagined</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">
            Transform how you dress with AI-powered virtual try-ons and personalized style recommendations.
          </p>
          <div className="flex flex-col gap-4 items-center w-full max-w-md mx-auto mb-2">
            <a href="https://apps.apple.com/us/app/closetly/id6744034749" target="_blank" rel="noopener noreferrer" className="button-primary">Download on App Store</a>
            <button type="button" onClick={() => setShowAndroidWaitlist(true)} className="button-secondary">Download on Android</button>
          </div>
        </header>

        {/* Avatar Try-On Feature Section */}
        <section className="flex flex-col items-center pt-2 pb-16 px-4 bg-white">
          <h2 className="text-2xl font-bold mb-6">Try On Outfits Instantly</h2>
          <div className="flex items-center justify-center" style={{ marginBottom: 32 }}>
            <video
              src="/avatar-new.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{ width: 220, height: 360, objectFit: 'contain', pointerEvents: 'none', background: 'transparent', display: 'block' }}
            />
          </div>
          <p className="text-gray-500 text-base max-w-md text-center">See how new styles look on you with our virtual try-on technology.</p>
        </section>

        {/* Features Section */}
        <section className="flex flex-col items-center py-16 px-4 gap-12 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl">
            {[
              {
                title: 'Virtual Try-On',
                desc: 'See how outfits look on you with AI-powered try-ons.',
                image: '/img/photo-1609357605129-26f69add5d6e.avif', // Updated image for Virtual Try-On
              },
              {
                title: 'Outfit Recommendations',
                desc: 'Get personalized outfit ideas based on your style and preferences.',
                image: '/img/hanging-clothes1.png', // Use the correct uploaded image
              },
              {
                title: 'Scan Your Clothes',
                desc: 'Upload your clothes and create a digital inventory of your items.',
                image: '/img/photo-1567401893414-76b7b1e5a7a5.avif', // Added image for Scan Your Clothes
              },
              {
                title: 'Save Outfit Ideas',
                desc: 'Create collections and save your favorite combinations.',
                image: '/img/hanging-clothes2.jpeg', // Added image for Save Outfit Ideas
              }
            ].map((feature, idx) => (
              <div key={feature.title} className="rounded-xl shadow-lg p-8 flex flex-col items-center border border-gray-200 hover:shadow-xl transition bg-white/80 h-full">
                <div className="flex flex-col justify-between h-full w-full items-center">
                  {/* Only show image for Outfit Recommendations and Save Outfit Ideas */}
                  {feature.image && (
                    <img src={feature.image} alt={feature.title} className="mb-4 w-25 h-25 object-cover rounded-lg" />
                  )}
                  <h3 className="font-bold text-xl mb-4 text-color text-center min-h-[2.5rem] flex items-center justify-center">{feature.title}</h3>
                  <p className="text-muted text-center min-h-[3.5rem] flex items-center justify-center">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Become a Closetly Creator Section */}
        <section className="flex flex-col items-center py-16 px-4 bg-white border-t border-gray-200 mt-8">
          <h2 className="text-3xl font-bold mb-2 text-color">Become a Closetly Creator</h2>
          <h3 className="text-xl font-semibold mb-2 text-secondary">Style. Influence. Earn.</h3>
          <p className="text-lg text-muted mb-6 max-w-2xl text-center">Turn your closet into a brand. Join the Closetly Creator Program and get rewarded for sharing your style.</p>
          <div className="flex flex-col items-center">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeSZQuXCZqaBT0EjFZoVwGZDpdKEsjDr3zLOYXikQjBI-5f1g/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#A98977] text-white px-6 py-3 rounded-lg font-semibold text-center mb-2 shadow hover:bg-[#8c7264] transition"
            >
              Join Now
            </a>
            <p className="text-xs mt-2 text-primary">Our team members review within 24 hours!</p>
          </div>
        </section>

        {/* Download Section */}
        <section id="download" className="flex flex-col items-center py-16 px-4 bg-white">
          <h2 className="text-3xl font-bold mb-6 text-color">Download Closetly Today</h2>
          <div className="flex flex-col sm:flex-row items-center gap-10">
            <div className="flex flex-col items-center">
              <div className="bg-white p-6 rounded-xl shadow-lg mb-3 border border-gray-200 flex justify-center items-center">
                <img src="/img/qr-new.png" alt="QR Code" width="200" height="200" style={{ border: '1px solid #000', display: 'block', margin: '0 auto' }} />
              </div>
              <span className="text-muted text-sm">Scan to Download</span>
            </div>
            <div className="flex flex-col gap-4 items-center">
              <a href="https://apps.apple.com/us/app/closetly/id6744034749" target="_blank" rel="noopener noreferrer" className="button-primary">Download on App Store</a>
              <button type="button" onClick={() => setShowAndroidWaitlist(true)} className="button-secondary">Download on Android</button>
              {/* Instagram button beneath Android */}
              <a href="https://www.instagram.com/closetly.app/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:opacity-80 transition mt-4">
                <Image src="/instagram.svg" alt="Instagram" width={40} height={40} />
              </a>

              {/* Inline Android Waitlist Card */}
              {showAndroidWaitlist && (
                <div className="w-full max-w-xl mt-2 bg-[#fdf6ee] border border-[#e5d3c0] rounded-xl shadow p-6 relative animate-fade-in">
                  <button
                    onClick={() => { setShowAndroidWaitlist(false); setWaitlistEmail(""); setWaitlistSubmitted(false); }}
                    className="button-primary px-4 py-2 w-auto min-w-[80px] ml-2"
                    aria-label="Close"
                  >
                    ×
                  </button>
                  <h3 className="text-xl font-extrabold mb-1 text-[#4d3a2a] font-serif">Join Android Waitlist</h3>
                  <p className="text-base text-[#a89b8a] mb-4">Be the first to know when Closetly launches on Android.</p>
                  {waitlistSubmitted ? (
                    <p className="text-success text-[#4d3a2a] text-base font-semibold">Thank you for joining the waitlist!</p>
                  ) : (
                    <form
                      className="flex flex-col sm:flex-row gap-3 items-center w-full"
                      onSubmit={e => { e.preventDefault(); setWaitlistSubmitted(true); }}
                    >
                      <input
                        type="email"
                        value={waitlistEmail}
                        onChange={e => setWaitlistEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="flex-1 px-4 py-2 rounded-lg border border-[#e5d3c0] bg-white text-[#4d3a2a] focus:outline-none focus:ring-2 focus:ring-[#e5d3c0]"
                        required
                      />
                      <button
                        type="submit"
                        disabled={!waitlistEmail || !waitlistEmail.includes("@")}
                        className="button-primary px-6 py-2 w-auto min-w-[140px]"
                      >
                        Join Waitlist
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full py-8 px-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 mt-8 bg-white">
          <div className="flex items-center gap-2 text-muted text-sm">
            &copy; {new Date().getFullYear()} Closetly. All rights reserved.
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <a href="https://www.instagram.com/closetly.app/" aria-label="Instagram" className="hover:opacity-70">
              <Image src="/instagram.svg" alt="Instagram" width={20} height={20} />
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
