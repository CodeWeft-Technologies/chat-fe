'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function PublicHomepage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 relative">
              <Image src="/cw.png" alt="CodeWeft Logo" width={40} height={40} className="w-full h-full" />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">CodeWeft</span>
          </div>

          {/* Desktop Menu */}
          <ul className="hidden md:flex gap-8 items-center">
            <li><a href="#features" className="text-gray-600 hover:text-gray-900 transition font-medium">Features</a></li>
            <li><a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition font-medium">How It Works</a></li>
            <li><a href="#contact" className="text-gray-600 hover:text-gray-900 transition font-medium">Contact</a></li>
            <li>
              <Link
                href="/login"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105"
              >
                Login
              </Link>
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <Link href="/login" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded-lg font-semibold text-sm hover:shadow-lg transition">
              Login
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <ul className="px-4 py-4 space-y-3">
              <li><a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-gray-600 hover:text-gray-900 font-medium">Features</a></li>
              <li><a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-gray-600 hover:text-gray-900 font-medium">How It Works</a></li>
              <li><a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block text-gray-600 hover:text-gray-900 font-medium">Contact</a></li>
            </ul>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-24 lg:py-32 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-60 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-100 to-blue-100 rounded-full blur-3xl opacity-60 animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>

          <div className="max-w-7xl mx-auto text-center relative z-10">
            <div className="inline-block mb-6 px-4 py-2 bg-blue-100 rounded-full">
              <span className="text-blue-700 font-semibold text-sm">🚀 AI-Powered Scheduling Solution</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 lg:mb-8 leading-tight">
              Your Intelligent<br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Scheduling Assistant</span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 lg:mb-12 leading-relaxed">
              Automate customer support, manage appointments with Google Calendar, and scale your business with AI-powered conversations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 lg:mb-16">
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:shadow-2xl transition transform hover:scale-105 inline-block w-full sm:w-auto text-center"
              >
                Get Started Free →
              </Link>
              <a
                href="#how-it-works"
                className="border-2 border-gray-300 text-gray-900 px-8 sm:px-10 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-50 transition inline-block w-full sm:w-auto text-center"
              >
                Watch Demo
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 max-w-2xl mx-auto">
              {[
                { label: 'Active Users', value: '1000+' },
                { label: 'Conversations', value: '100K+' },
                { label: 'Uptime', value: '99.9%' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">Powerful Features</h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">Everything you need to build and deploy intelligent chatbots</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                { icon: '💬', title: 'AI Chat', desc: 'Context-aware conversations using advanced RAG technology' },
                { icon: '📅', title: 'Calendar Sync', desc: 'Real-time Google Calendar integration & booking' },
                { icon: '📚', title: 'Knowledge Base', desc: 'Upload documents, PDFs, and websites' },
                { icon: '🔗', title: 'Easy Embed', desc: 'Copy-paste code integration in seconds' },
                { icon: '📊', title: 'Analytics', desc: 'Track conversations and user insights' },
                { icon: '🔐', title: 'Enterprise Security', desc: 'Encrypted & fully compliant' },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition transform hover:-translate-y-1 border border-gray-200 hover:border-blue-300"
                >
                  <div className="text-4xl sm:text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section id="features" className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">Perfect For Any Industry</h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">Join businesses across healthcare, real estate, education, and more</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                { icon: '🏥', title: 'Healthcare', desc: 'Appointment scheduling & patient FAQs' },
                { icon: '🏠', title: 'Real Estate', desc: 'Property viewings & buyer inquiries' },
                { icon: '💼', title: 'Consulting', desc: 'Client support & demo scheduling' },
                { icon: '🎓', title: 'Education', desc: 'Tutor bookings & student support' },
                { icon: '🍽️', title: 'Restaurants', desc: 'Reservations & menu inquiries' },
                { icon: '📱', title: 'SaaS', desc: 'Customer support & demo requests' },
              ].map((item, i) => (
                <div key={i} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 sm:p-8 border border-gray-200 hover:border-blue-300 transition">
                  <div className="text-4xl sm:text-5xl mb-4">{item.icon}</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">Get Started in Minutes</h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">Simple steps to launch your AI chatbot</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                { num: 1, title: 'Sign Up', desc: 'Create account with Google Login in 30 seconds' },
                { num: 2, title: 'Connect Calendar', desc: 'Securely link your Google Calendar' },
                { num: 3, title: 'Train Bot', desc: 'Upload documents & knowledge base' },
                { num: 4, title: 'Customize', desc: 'Set responses & welcome messages' },
                { num: 5, title: 'Embed', desc: 'Add one line of code to your site' },
                { num: 6, title: 'Monitor', desc: 'Track analytics & optimize' },
              ].map((step) => (
                <div key={step.num} className="bg-white rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition border border-gray-200">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg mb-4 flex-shrink-0">
                    {step.num}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">Why CodeWeft?</h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">Industry-leading features and support</p>
            </div>

            <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
              {[
                { icon: '✅', title: 'Google Calendar Built-in', desc: 'Native integration—no third-party tools needed. Automatic syncing prevents double bookings.' },
                { icon: '🔒', title: 'Security First', desc: 'Enterprise-grade encryption, OAuth 2.0, and full GDPR compliance.' },
                { icon: '⚡', title: '99.9% Uptime', desc: 'Reliable infrastructure that scales with your business.' },
                { icon: '🎯', title: 'AI-Powered RAG', desc: 'Advanced retrieval-augmented generation for accurate answers from your knowledge base.' },
                { icon: '📊', title: 'Real-time Analytics', desc: 'Track conversations, satisfaction, and booking trends.' },
                { icon: '🚀', title: 'Fast Deployment', desc: 'Go live in under 5 minutes with our simple embed code.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 sm:gap-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 sm:p-8 border border-blue-200 hover:border-blue-400 transition">
                  <div className="text-2xl sm:text-3xl flex-shrink-0">{item.icon}</div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm sm:text-base">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">Loved by Teams</h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">See what our users say about CodeWeft</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                { icon: '⭐⭐⭐⭐⭐', quote: 'Reduced our scheduling time by 80%. Game changer!', author: 'Sarah M., Healthcare' },
                { icon: '⭐⭐⭐⭐⭐', quote: 'Seamless Calendar integration. No double-bookings ever.', author: 'James T., Consulting' },
                { icon: '⭐⭐⭐⭐⭐', quote: 'Support tickets dropped 60%. Highly recommend.', author: 'Emily R., SaaS' },
              ].map((testimonial, i) => (
                <div key={i} className="bg-white rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition border-t-4 border-blue-600">
                  <div className="mb-4 text-lg">{testimonial.icon}</div>
                  <p className="text-gray-700 italic mb-4 text-sm sm:text-base">&quot;{testimonial.quote}&quot;</p>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contact" className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
          <div className="absolute inset-0 opacity-10 bg-pattern"></div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 sm:mb-8">Ready to Get Started?</h2>
            <p className="text-lg sm:text-xl text-white/90 mb-8 sm:mb-12">Join hundreds of businesses automating customer interactions today.</p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16">
              <Link
                href="/register"
                className="bg-white text-blue-600 px-8 sm:px-10 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:shadow-2xl transition transform hover:scale-105 inline-block w-full sm:w-auto text-center"
              >
                Start Free Trial
              </Link>
              <a
                href="mailto:codeweft.ai@gmail.com"
                className="border-2 border-white text-white px-8 sm:px-10 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-white/10 transition inline-block w-full sm:w-auto text-center"
              >
                Contact Sales
              </a>
            </div>

            {/* Contact Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-white/20">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Email Support</h3>
              <a href="mailto:codeweft.ai@gmail.com" className="text-white hover:text-white/80 transition text-base sm:text-lg font-medium">
                codeweft.ai@gmail.com
              </a>
              <p className="text-white/70 text-sm mt-3">We respond within 24 hours</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8 sm:mb-12">
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><Link href="/register" className="hover:text-white transition">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:codeweft.ai@gmail.com" className="hover:text-white transition">Email</a></li>
                <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <p className="text-sm">Building the future of AI-powered customer interactions.</p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 CodeWeft Chatbot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
