"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import LoginModal from "@/components/LoginModal";

export default function LandingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center me-100 animate-fade-in-left">
            <Image src="/logo_new.png" alt="Resourcify logo" width={180} height={180} className="object-contain" />
          </div>

          {/* Auth Buttons */}
          <div className="flex gap-3 animate-fade-in-right">
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="px-5 py-2 bg-gray-100 border-none rounded-lg text-sm font-medium text-black hover:bg-gray-200 transition-all duration-200 cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="px-5 py-2 bg-black border-none rounded-lg text-sm font-medium text-white hover:bg-gray-950 duration-300 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-16 px-6 overflow-hidden bg-white">
        {/* Grid Background */}
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:50px_50px]",
            "[background-image:linear-gradient(to_right,#e4e4e4_1px,transparent_1px),linear-gradient(to_bottom,#cccccc_1px,transparent_1px)]"
          )}
        />

        {/* Subtle color accents */}
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-violet-100 blur-[120px] opacity-60 pointer-events-none"></div>
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-100 blur-[120px] opacity-50 pointer-events-none"></div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl animate-fade-in-up">

          <span className="text-5xl text-black md:text-7xl font-bold text-black mb-8 tracking-tight">
            Manage Resources
            <span className="block mt-2 text-black">Without the Chaos</span>
          </span>

          <p className="text-xl text-gray-600 leading-relaxed mb-12 max-w-2xl mx-auto">
            One platform to book, track, and optimize every resource in your organization. From <span className="text-violet-600 font-medium">meeting rooms</span> to <span className="text-violet-600 font-medium">equipments</span> - all in one place.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="px-8 py-4 bg-black border-none rounded-lg text-base font-semibold text-white hover:bg-gray-800 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Stats/Trust Section */}
        <div className="relative z-10 mt-20 animate-fade-in-up animation-delay-300">
          <div className="flex items-center gap-12 bg-white px-12 py-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex flex-col items-center gap-1">
              <span className="text-4xl font-bold text-black">369<span className="text-indigo-600">+</span></span>
              <span className="text-sm text-gray-500 font-medium">Organizations</span>
            </div>
            <div className="w-px h-12 bg-gray-200"></div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-4xl font-bold text-black">10k<span className="text-violet-600">+</span></span>
              <span className="text-sm text-gray-500 font-medium">Resources Managed</span>
            </div>
            <div className="w-px h-12 bg-gray-200"></div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-4xl font-bold text-black">99.9<span className="text-indigo-600">%</span></span>
              <span className="text-sm text-gray-500 font-medium">Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-3xl md:text-4xl font-bold text-black mb-4">Everything you need</span>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">Powerful features to help you manage, track, and optimize all your organizational resources.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature Card 1 */}
            <div className="p-6 bg-white rounded-2xl border border-gray-100 hover:-translate-y-2 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 group">
              <div className="w-12 h-12 flex items-center justify-center bg-indigo-100 rounded-xl mb-5 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-black mb-2">Resource Management</span>
              <p className="text-sm text-gray-600 leading-relaxed">Organize all your resources in one place — classrooms, labs, auditoriums, and more.</p>
            </div>

            {/* Feature Card 2 */}
            <div className="p-6 bg-white rounded-2xl border border-gray-100 hover:-translate-y-2 hover:shadow-xl hover:border-violet-200 transition-all duration-300 group">
              <div className="w-12 h-12 flex items-center justify-center bg-violet-100 rounded-xl mb-5 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4" />
                  <path d="M8 2v4" />
                  <path d="M3 10h18" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-black mb-2">Smart Booking</span>
              <p className="text-sm text-gray-600 leading-relaxed">Easy booking process with automatic conflict detection and approval workflows.</p>
            </div>

            {/* Feature Card 3 */}
            <div className="p-6 bg-white rounded-2xl border border-gray-100 hover:-translate-y-2 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 group">
              <div className="w-12 h-12 flex items-center justify-center bg-indigo-100 rounded-xl mb-5 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-black mb-2">Maintenance Tracking</span>
              <p className="text-sm text-gray-600 leading-relaxed">Automated maintenance alerts and scheduling to keep resources in top condition.</p>
            </div>

            {/* Feature Card 4 */}
            <div className="p-6 bg-white rounded-2xl border border-gray-100 hover:-translate-y-2 hover:shadow-xl hover:border-violet-200 transition-all duration-300 group">
              <div className="w-12 h-12 flex items-center justify-center bg-violet-100 rounded-xl mb-5 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18" />
                  <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-black mb-2">Analytics & Reports</span>
              <p className="text-sm text-gray-600 leading-relaxed">Comprehensive reports for usage insights, booking trends, and resource optimization.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-gray-100 bg-white">
        <p className="text-gray-400 text-sm">© 2025 Resourcify. All rights reserved.</p>
      </footer>
    </div>
  );
}
