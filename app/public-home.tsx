'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function PublicHomepage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-1000 bg-gradient-to-r from-blue-600 via-purple-600 to-purple-800 text-white shadow-lg">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 text-2xl font-bold">
            <Image src="/cw.png" alt="CodeWeft Logo" width={40} height={40} />
            <span>CodeWeft Chatbot</span>
          </div>
          <ul className="hidden md:flex gap-8 items-center">
            <li>
              <a href="#features" className="hover:opacity-80 transition">
                Features
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:opacity-80 transition">
                How It Works
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:opacity-80 transition">
                Contact
              </a>
            </li>
            <li>
              <Link
                href="/login"
                className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:shadow-lg transition transform hover:scale-105"
              >
                Login
              </Link>
            </li>
          </ul>
          <div className="md:hidden">
            <Link
              href="/login"
              className="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold text-sm"
            >
              Login
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 bg-gradient-to-br from-blue-50 via-purple-50 to-white">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Your AI-Powered Scheduling & Knowledge Assistant
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Seamlessly integrate intelligent chatbots with Google Calendar for smarter scheduling, appointment management, and instant knowledge retrieval powered by advanced AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition transform hover:scale-105 inline-block"
              >
                Get Started Free
              </Link>
              <a
                href="#contact"
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition inline-block"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>

        {/* What It Does */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
              What CodeWeft Chatbot Does
            </h2>
            <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
              CodeWeft Chatbot transforms how businesses interact with customers and manage scheduling. Our AI-powered chatbot platform enables:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: '💬',
                  title: 'Intelligent Chat',
                  desc: 'AI-powered conversations that understand context and provide accurate, helpful responses using advanced retrieval-augmented generation (RAG) technology.',
                },
                {
                  icon: '📅',
                  title: 'Google Calendar Integration',
                  desc: 'Seamlessly check availability and book appointments directly through the chatbot. Your calendar stays in sync automatically.',
                },
                {
                  icon: '📝',
                  title: 'Knowledge Management',
                  desc: 'Upload documents, websites, and PDFs. The AI learns your content and provides accurate answers to customer questions instantly.',
                },
                {
                  icon: '🔗',
                  title: 'Easy Integration',
                  desc: 'Embed the chatbot on your website with a single line of code. No complex setup required—it just works.',
                },
                {
                  icon: '📊',
                  title: 'Analytics Dashboard',
                  desc: 'Track conversations, user satisfaction, and booking trends with detailed analytics and insights.',
                },
                {
                  icon: '🔐',
                  title: 'Secure & Privacy-First',
                  desc: 'Enterprise-grade security with encrypted data, role-based access controls, and full compliance with data privacy regulations.',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition transform hover:-translate-y-1"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who It&apos;s For */}
        <section id="features" className="px-4 sm:px-6 lg:px-8 py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">
              Who It&apos;s For
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: '🏥', title: 'Healthcare Providers', desc: 'Automate appointment scheduling, answer patient FAQs, and manage calendar availability efficiently.' },
                { icon: '💼', title: 'Consulting Firms', desc: 'Handle client inquiries, provide instant responses to service questions, and manage consultant availability.' },
                { icon: '🏠', title: 'Real Estate Agents', desc: 'Schedule property viewings, answer buyer questions about listings, and manage multiple calendar bookings.' },
                { icon: '🎓', title: 'Educational Institutions', desc: 'Schedule tutoring sessions, answer student questions, and manage professor office hours automatically.' },
                { icon: '🍽️', title: 'Restaurants & Venues', desc: 'Handle reservations, answer menu questions, and manage table availability in real-time.' },
                { icon: '📱', title: 'SaaS Companies', desc: 'Provide instant customer support, schedule demos, and answer product questions 24/7.' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Google Calendar & Login */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">
              Why Google Calendar & Google Login?
            </h2>

            <div className="space-y-6">
              {[
                {
                  title: '🔐 Security & Trust',
                  desc: 'Google Login uses OAuth 2.0, industry-standard security ensuring your credentials are never shared with us. We only access the permissions you explicitly grant.',
                },
                {
                  title: '📅 Real-Time Synchronization',
                  desc: 'Google Calendar integration keeps your schedule automatically updated. Customers book appointments that appear instantly in your calendar, eliminating double-bookings and scheduling conflicts.',
                },
                {
                  title: '✅ Familiar & Convenient',
                  desc: 'Most professionals already use Google Calendar. There\'s no new tool to learn or calendar system to manage—everything works with tools you already trust.',
                },
                {
                  title: '🌐 Universal Compatibility',
                  desc: 'Google Workspace is used by millions worldwide. Our integration works seamlessly whether you\'re managing one calendar or multiple team calendars.',
                },
              ].map((item, i) => (
                <div key={i} className="border-l-4 border-blue-600 bg-blue-50 p-6 rounded-r-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-700">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="px-4 sm:px-6 lg:px-8 py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">
              How It Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { num: 1, title: 'Sign Up', desc: 'Create your account using Google Login. Takes less than 30 seconds—no passwords to remember.' },
                { num: 2, title: 'Connect Google Calendar', desc: 'Grant secure access to your Google Calendar. We only see availability—your events remain private.' },
                { num: 3, title: 'Train Your Chatbot', desc: 'Upload knowledge: documents, FAQs, website URLs, or PDFs. The AI learns your content instantly.' },
                { num: 4, title: 'Embed on Website', desc: 'Copy a single line of code and paste it into your website. Your chatbot is now live.' },
                { num: 5, title: 'Go Live', desc: 'Your chatbot starts answering customer questions and booking appointments immediately.' },
                { num: 6, title: 'Monitor & Optimize', desc: 'View analytics, improve responses, and refine your knowledge base based on customer interactions.' },
              ].map((step) => (
                <div key={step.num} className="bg-white rounded-lg p-8 shadow-md">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg mb-4">
                    {step.num}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">
              What Our Users Say
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: '"CodeWeft Chatbot reduced our scheduling time by 80%. Customers book appointments without calling us."',
                  author: 'Sarah M., Healthcare Provider',
                },
                {
                  quote: '"The integration with Google Calendar was seamless. No double-bookings, no manual updates. It just works."',
                  author: 'James T., Consulting Firm',
                },
                {
                  quote: '"Our support tickets dropped 60% after deploying the chatbot. It answers most FAQs automatically."',
                  author: 'Emily R., SaaS Company',
                },
              ].map((testimonial, i) => (
                <div key={i} className="bg-gray-50 border-t-4 border-blue-600 rounded-lg p-8">
                  <p className="text-gray-700 italic mb-4">{testimonial.quote}</p>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contact" className="px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8">Get Started Today</h2>
            <p className="text-xl mb-12 opacity-90">
              Join hundreds of businesses automating their customer interactions and scheduling.
            </p>
            <Link
              href="/register"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition transform hover:scale-105"
            >
              Start Free Trial
            </Link>

            <div className="mt-20 pt-16 border-t border-white/20">
              <h3 className="text-2xl font-bold mb-8 text-center">Contact Us</h3>
              <div className="flex justify-center">
                <div className="bg-white/10 rounded-lg p-8 backdrop-blur-sm max-w-sm w-full">
                  <h4 className="text-lg font-semibold mb-4 text-center">Email Support</h4>
                  <p className="text-center">
                    <a href="mailto:codeweft.ai@gmail.com" className="hover:underline text-white font-medium">
                      codeweft.ai@gmail.com
                    </a>
                  </p>
                  <p className="text-sm opacity-75 mt-3 text-center">We typically respond within 24 hours.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white transition">
                    How It Works
                  </a>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white transition">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition">
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="hover:text-white transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="mailto:support@chatbot.codeweft.in" className="hover:text-white transition">
                    Email Support
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white transition">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Follow</h4>
              <p className="text-sm">Connect with us on social media for updates and news.</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 CodeWeft Chatbot. All rights reserved. | Powered by AI & Google Calendar Integration</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
