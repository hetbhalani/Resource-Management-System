"use client";

import React from 'react';
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 animate-fade-in-left">
            <div className="grid grid-cols-2 gap-1">
              <div className="w-2 h-2 bg-indigo-600 rounded-sm"></div>
              <div className="w-2 h-2 bg-violet-500 rounded-sm"></div>
              <div className="w-2 h-2 bg-violet-500 rounded-sm"></div>
              <div className="w-2 h-2 bg-indigo-600 rounded-sm"></div>
            </div>
            <span className="text-xl font-bold text-black">Resourcify</span>
          </div>

          {/* Auth Buttons */}
          <div className="flex gap-3 animate-fade-in-right">
            <button className="px-5 py-2 bg-gray-100 border-none rounded-lg text-sm font-medium text-black hover:bg-gray-200 transition-all duration-200 cursor-pointer">
              Sign In
            </button>
            <button className="px-5 py-2 bg-black border-none rounded-lg text-sm font-medium text-white hover:bg-gray-800 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
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
            "[background-image:linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)]"
          )}
        />

        {/* Subtle color accents */}
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-violet-100 blur-[120px] opacity-60 pointer-events-none"></div>
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-100 blur-[120px] opacity-50 pointer-events-none"></div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
            <span className="text-sm text-black font-medium">Now with AI-powered scheduling</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-black mb-8 tracking-tight">
            Manage Resources
            <span className="block mt-2 text-black">Without the Chaos</span>
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed mb-12 max-w-2xl mx-auto">
            One platform to book, track, and optimize every resource in your organization. From <span className="text-indigo-600 font-medium">meeting rooms</span> to <span className="text-violet-600 font-medium">equipment</span> — all in one place.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <button className="px-8 py-4 bg-black border-none rounded-lg text-base font-semibold text-white hover:bg-gray-800 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              Start Free Trial
            </button>
            <button className="px-8 py-4 bg-white border border-gray-200 rounded-lg text-base font-semibold text-black hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              Book a Demo
            </button>
          </div>
        </div>

        {/* Stats/Trust Section */}
        <div className="relative z-10 mt-20 animate-fade-in-up animation-delay-300">
          <div className="flex items-center gap-12 bg-white px-12 py-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex flex-col items-center gap-1">
              <span className="text-4xl font-bold text-black">500<span className="text-indigo-600">+</span></span>
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
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Everything you need</h2>
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
              <h3 className="text-lg font-semibold text-black mb-2">Resource Management</h3>
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
              <h3 className="text-lg font-semibold text-black mb-2">Smart Booking</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Easy booking process with automatic conflict detection and approval workflows.</p>
            </div>

            {/* Feature Card 3 */}
            <div className="p-6 bg-white rounded-2xl border border-gray-100 hover:-translate-y-2 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 group">
              <div className="w-12 h-12 flex items-center justify-center bg-indigo-100 rounded-xl mb-5 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Maintenance Tracking</h3>
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
              <h3 className="text-lg font-semibold text-black mb-2">Analytics & Reports</h3>
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
