'use client';

import { useState } from 'react';

type DocSection = 'overview' | 'widgets' | 'welcome' | 'customization' | 'usage' | 'config' | 'forms' | 'formbuilder' | 'calendar' | 'knowledgebase';

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState<DocSection>('overview');

  const sections = [
    { id: 'overview', label: 'Overview', icon: '📖' },
    { id: 'widgets', label: 'Widget Types', icon: '🎨' },
    { id: 'welcome', label: 'Welcome Message', icon: '👋' },
    { id: 'knowledgebase', label: 'Knowledge Base', icon: '📚' },
    { id: 'customization', label: 'Customization', icon: '⚙️' },
    { id: 'usage', label: 'Usage Analytics', icon: '📊' },
    { id: 'config', label: 'Configuration', icon: '🔧' },
    { id: 'forms', label: 'Form Links', icon: '📋' },
    { id: 'formbuilder', label: 'Form Builder', icon: '🏗️' },
    { id: 'calendar', label: 'Calendar Setup', icon: '📅' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📚 CodeWeft Documentation</h1>
          <p className="text-lg text-gray-600">Complete guide to building, configuring, and managing your chatbot</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4">Sections</h2>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as DocSection)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{section.icon}</span>
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-8">
              {activeSection === 'overview' && <OverviewSection />}
              {activeSection === 'widgets' && <WidgetsSection />}
              {activeSection === 'welcome' && <WelcomeSection />}
              {activeSection === 'knowledgebase' && <KnowledgeBaseSection />}
              {activeSection === 'customization' && <CustomizationSection />}
              {activeSection === 'usage' && <UsageSection />}
              {activeSection === 'config' && <ConfigSection />}
              {activeSection === 'forms' && <FormsSection />}
              {activeSection === 'formbuilder' && <FormBuilderSection />}
              {activeSection === 'calendar' && <CalendarSection />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Overview Section
function OverviewSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">📖 Documentation Overview</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Welcome to the CodeWeft Chatbot Platform documentation! This comprehensive guide will help you understand and master every aspect of building, deploying, and managing intelligent chatbots.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
          <h3 className="text-lg font-bold text-blue-900 mb-2">🎨 Widget Types</h3>
          <p className="text-blue-800 text-sm">Learn about different widget layouts including Bubble Chat, Dark Bubble, Embedded, CDN Widget, Card Style, and Full Screen options.</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-100">
          <h3 className="text-lg font-bold text-green-900 mb-2">👋 Welcome Messages</h3>
          <p className="text-green-800 text-sm">Configure personalized welcome messages, customize content, and set up greeting templates for your users.</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
          <h3 className="text-lg font-bold text-purple-900 mb-2">⚙️ Customization</h3>
          <p className="text-purple-800 text-sm">Customize appearance, colors, positioning, sizing, and styling to match your brand identity.</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-lg border border-orange-100">
          <h3 className="text-lg font-bold text-orange-900 mb-2">📊 Advanced Features</h3>
          <p className="text-orange-800 text-sm">Monitor analytics, manage forms, configure settings, and integrate with external services.</p>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
        <p className="text-blue-800"><strong>💡 Tip:</strong> Start with the Widget Types section if you&apos;re new to CodeWeft, then explore customization options to match your branding.</p>
      </div>
    </div>
  );
}

// Widget Types Section
function WidgetsSection() {
  const widgets = [
    {
      name: 'Bubble Chat',
      icon: '💬',
      description: 'A floating chat bubble that appears in the bottom-right corner of your website.',
      features: [
        'Floating button with chat window',
        'Minimal screen footprint',
        'Perfect for websites with limited space',
        'Responsive and mobile-friendly',
        'Customizable button size and position'
      ],
      usage: 'Best for general-purpose chatbots where you want to avoid taking up too much screen space.'
    },
    {
      name: 'Dark Bubble',
      icon: '🌙',
      description: 'A dark-themed variant of the bubble chat, ideal for modern dark websites.',
      features: [
        'Dark theme by default',
        'High contrast UI',
        'Suitable for tech-focused websites',
        'Night mode compatible',
        'Professional appearance'
      ],
      usage: 'Use this for websites with dark themes or for a more sophisticated look.'
    },
    {
      name: 'Embedded Widget',
      icon: '📌',
      description: 'Embed the chatbot directly into a specific location on your webpage.',
      features: [
        'Persistent chat interface',
        'Customizable width and height',
        'Doesn\'t float or overlap content',
        'Part of the page layout',
        'Great for dedicated chat pages'
      ],
      usage: 'Perfect for having a dedicated chat section on your website, support pages, or landing pages.'
    },
    {
      name: 'CDN Widget',
      icon: '🌐',
      description: 'Universal script-based widget that works across different domains.',
      features: [
        'Single script tag installation',
        'Works on any website',
        'No build configuration needed',
        'Easy deployment',
        'Cross-domain compatible'
      ],
      usage: 'Ideal when you need to add the chatbot to multiple websites or require quick deployment.'
    },
    {
      name: 'Card Style',
      icon: '🎴',
      description: 'A compact card-based widget design with information display.',
      features: [
        'Card-based layout',
        'Shows bot information prominently',
        'Collapsible interface',
        'Clean, organized appearance',
        'Good for FAQ sections'
      ],
      usage: 'Great for showing quick information, FAQs, or when you want a more compact interface.'
    },
    {
      name: 'Full Screen',
      icon: '🖥️',
      description: 'Full-screen modal that takes over the entire viewport.',
      features: [
        'Immersive user experience',
        'Maximum visibility',
        'Large interaction area',
        'Best for complex conversations',
        'Memorable user interaction'
      ],
      usage: 'Use for important conversations, product demos, or when you want full user attention.'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">🎨 Widget Types & Layouts</h2>
        <p className="text-gray-700">CodeWeft offers multiple widget layouts to suit different use cases and website designs.</p>
      </div>

      {widgets.map((widget, idx) => (
        <div key={idx} className="border-l-4 border-gray-200 pl-6 py-4">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-3xl">{widget.icon}</span>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{widget.name}</h3>
              <p className="text-gray-600">{widget.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">✨ Features</h4>
              <ul className="space-y-1">
                {widget.features.map((feature, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-500 mt-1">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">💡 Best For</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{widget.usage}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded">
        <p className="text-amber-900"><strong>🔑 Key Tip:</strong> You can change widget types anytime from the Configuration page. Test different layouts to see which one provides the best user experience for your specific use case.</p>
      </div>
    </div>
  );
}

// Welcome Section
function WelcomeSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">👋 Welcome Message Configuration</h2>
        <p className="text-gray-700">The welcome message is the first interaction users have with your chatbot. Make it count!</p>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-3">📝 How to Set Up Welcome Message</h3>
          <ol className="space-y-2 text-gray-800">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">1.</span>
              <span>Navigate to your Bot Configuration</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">2.</span>
              <span>Find the &quot;Welcome Message&quot; section</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">3.</span>
              <span>Write your personalized greeting message</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">4.</span>
              <span>Click &quot;Save Changes&quot; to update</span>
            </li>
          </ol>
        </div>

        <div className="border-l-4 border-purple-500 pl-4 py-2">
          <h4 className="font-bold text-gray-900 mb-2">✍️ Welcome Message Best Practices</h4>
          <ul className="space-y-2 text-gray-700">
            <li>• <strong>Be personalized:</strong> Address the user by name if possible</li>
            <li>• <strong>Be concise:</strong> Keep it under 2-3 sentences</li>
            <li>• <strong>Be clear:</strong> Explain what the bot can help with</li>
            <li>• <strong>Be inviting:</strong> Encourage interaction with a call-to-action</li>
            <li>• <strong>Match your brand:</strong> Use your brand voice and tone</li>
            <li>• <strong>Include examples:</strong> &quot;You can ask me about...&quot; suggestions</li>
          </ul>
        </div>

        <div className="border-l-4 border-green-500 pl-4 py-2">
          <h4 className="font-bold text-gray-900 mb-2">Examples</h4>
          <div className="space-y-3">
            <div className="bg-green-50 p-3 rounded">
              <p className="text-sm font-semibold text-green-900">👋 Friendly Approach</p>
              <p className="text-sm text-gray-700 mt-1">&quot;Hi! Welcome to our support team. I&apos;m your AI assistant and I&apos;m here to help answer your questions about our products and services. What can I help you with today?&quot;</p>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm font-semibold text-blue-900">💼 Professional Approach</p>
              <p className="text-sm text-gray-700 mt-1">&quot;Good day. My role is to provide you with accurate information regarding our services, pricing, and technical support. How may I assist you?&quot;</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded">
          <p className="text-yellow-900"><strong>💬 Pro Tip:</strong> Test your welcome message with real users and gather feedback. Update it periodically based on common questions or new features.</p>
        </div>
      </div>
    </div>
  );
}

// Knowledge Base Section
function KnowledgeBaseSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">📚 Knowledge Base Management</h2>
        <p className="text-gray-700">Feed your chatbot with content so it can provide accurate, contextual answers to user queries.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg border border-orange-200">
          <h3 className="text-lg font-bold text-orange-900 mb-4">🚀 Getting Started with Knowledge Base</h3>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="font-bold text-orange-600 bg-orange-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              <div>
                <p className="font-semibold text-gray-900">Navigate to Knowledge Base</p>
                <p className="text-sm text-gray-700">Go to the &quot;Knowledge Base&quot; section from the main navigation</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-orange-600 bg-orange-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
              <div>
                <p className="font-semibold text-gray-900">Select Your Target Bot</p>
                <p className="text-sm text-gray-700">Choose which bot should receive this knowledge</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-orange-600 bg-orange-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
              <div>
                <p className="font-semibold text-gray-900">Choose Input Method</p>
                <p className="text-sm text-gray-700">Select Documents, Text, Q&A, or Website</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-orange-600 bg-orange-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
              <div>
                <p className="font-semibold text-gray-900">Upload or Add Content</p>
                <p className="text-sm text-gray-700">Add your files, text, questions, or website URLs</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-orange-600 bg-orange-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">5</span>
              <div>
                <p className="font-semibold text-gray-900">Click &quot;Upload & Process&quot;</p>
                <p className="text-sm text-gray-700">System will chunk, embed, and index your content</p>
              </div>
            </li>
          </ol>
        </div>

        <div className="border-l-4 border-blue-500 pl-4 py-2">
          <h4 className="font-bold text-gray-900 mb-3">📋 Content Input Methods</h4>
          <div className="space-y-3">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold text-blue-900 mb-2">📄 Documents Tab</p>
              <p className="text-sm text-blue-800 mb-2"><strong>Upload files:</strong> PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, and more</p>
              <p className="text-sm text-blue-800"><strong>Use Case:</strong> Your complete product documentation, manuals, training materials, research papers</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="font-semibold text-purple-900 mb-2">✏️ Text Tab</p>
              <p className="text-sm text-purple-800 mb-2"><strong>Paste text directly:</strong> Copy-paste content from anywhere</p>
              <p className="text-sm text-purple-800"><strong>Use Case:</strong> FAQ pages, blog posts, policy documents, custom content</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="font-semibold text-green-900 mb-2">❓ Q&A Tab</p>
              <p className="text-sm text-green-800 mb-2"><strong>Add Q&A pairs:</strong> Manually create question and answer pairs</p>
              <p className="text-sm text-green-800"><strong>Use Case:</strong> Common questions, specific use cases, contextual answers</p>
            </div>
            <div className="bg-cyan-50 p-4 rounded-lg">
              <p className="font-semibold text-cyan-900 mb-2">🌐 Website Tab</p>
              <p className="text-sm text-cyan-800 mb-2"><strong>Add website URLs:</strong> Bot will crawl and index web pages</p>
              <p className="text-sm text-cyan-800"><strong>Use Case:</strong> Your website, blog, public documentation, knowledge portals</p>
            </div>
          </div>
        </div>

        <div className="border-l-4 border-green-500 pl-4 py-2">
          <h4 className="font-bold text-gray-900 mb-2">✨ Supported File Types</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-gray-800 mb-2">📑 Documents:</p>
              <p className="text-sm text-gray-700 bg-green-50 p-3 rounded">PDF • DOC • DOCX • PPT • PPTX • XLS • XLSX</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-2">🖼️ Other Formats:</p>
              <p className="text-sm text-gray-700 bg-green-50 p-3 rounded">CSV • TXT • PNG • JPG • JPEG • WEBP</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200">
          <h4 className="font-bold text-indigo-900 mb-3">⚙️ How Knowledge Base Works</h4>
          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="text-xl">🔄</span>
              <div>
                <p className="font-semibold text-gray-900">Processing</p>
                <p className="text-sm text-gray-700">Your content is processed using advanced NLP to extract meaningful information</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">📦</span>
              <div>
                <p className="font-semibold text-gray-900">Chunking</p>
                <p className="text-sm text-gray-700">Large documents are split into manageable chunks while preserving context</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">🧠</span>
              <div>
                <p className="font-semibold text-gray-900">Embedding</p>
                <p className="text-sm text-gray-700">Content is converted to vector embeddings for semantic search</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">💾</span>
              <div>
                <p className="font-semibold text-gray-900">Storage</p>
                <p className="text-sm text-gray-700">Embeddings are stored in a vector database for fast retrieval</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">🎯</span>
              <div>
                <p className="font-semibold text-gray-900">Retrieval</p>
                <p className="text-sm text-gray-700">When users ask questions, relevant content is automatically retrieved and used to generate answers</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-l-4 border-purple-500 pl-4 py-2">
          <h4 className="font-bold text-gray-900 mb-2">📊 Knowledge Base Best Practices</h4>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>✓ <strong>Quality over quantity:</strong> Curate high-quality content rather than adding everything</li>
            <li>✓ <strong>Keep it updated:</strong> Regularly update documentation to reflect changes</li>
            <li>✓ <strong>Remove duplicates:</strong> Avoid duplicate content which can confuse the bot</li>
            <li>✓ <strong>Organize clearly:</strong> Use clear titles and structure within documents</li>
            <li>✓ <strong>Mix content types:</strong> Combine documents, FAQs, and Q&A for better coverage</li>
            <li>✓ <strong>Test thoroughly:</strong> Ask your bot questions to verify it&apos;s learning correctly</li>
            <li>✓ <strong>Monitor performance:</strong> Check analytics to see what questions users ask most</li>
          </ul>
        </div>

        <div className="border-l-4 border-amber-500 pl-4 py-2">
          <h4 className="font-bold text-gray-900 mb-2">⚠️ Important Considerations</h4>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• <strong>File Size Limits:</strong> Individual files should be under 100MB</li>
            <li>• <strong>Processing Time:</strong> Large batches may take time to process. You&apos;ll see a progress indicator</li>
            <li>• <strong>Accuracy:</strong> Bot accuracy depends on knowledge base quality and completeness</li>
            <li>• <strong>Privacy:</strong> All content is securely stored and encrypted. Keep sensitive data separate</li>
            <li>• <strong>Updates:</strong> When you update content, old knowledge is replaced (not accumulated)</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h4 className="font-bold text-blue-900 mb-2">💡 Optimization Tips</h4>
          <ul className="space-y-2 text-sm text-blue-900">
            <li>✓ For PDFs: Use searchable PDFs (not scanned images)</li>
            <li>✓ For websites: Use your sitemap for better crawling</li>
            <li>✓ For Q&A: Write questions as users would ask them</li>
            <li>✓ For text: Format with clear structure (headings, lists)</li>
            <li>✓ Monitor bot responses for accuracy and refine knowledge base as needed</li>
          </ul>
        </div>

        <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
          <p className="text-green-800"><strong>✅ Next Steps:</strong> After adding knowledge base content, test your bot directly in the chat widget. Ask various questions to ensure it&apos;s retrieving the right information and providing accurate answers.</p>
        </div>
      </div>
    </div>
  );
}

// Customization Section
function CustomizationSection() {
  const options = [
    {
      category: 'Theme & Layout',
      items: [
        { name: 'Theme Mode', desc: 'Choose between Light Mode, Dark Mode, or Auto (follows system settings)' },
        { name: 'Position', desc: 'Select where the widget appears: Bottom Right, Bottom Left, Top Right, or Top Left' },
        { name: 'Corner Radius', desc: 'Adjust the roundedness of corners from 0px to 24px' },
      ]
    },
    {
      category: 'Colors & Styling',
      items: [
        { name: 'Brand Color', desc: 'Set your primary brand color (shown in header and buttons)' },
        { name: 'Chat Button Color', desc: 'Customize the floating chat button color' },
        { name: 'Auto Contrast', desc: 'Enable automatic text contrast adjustment for better readability' },
        { name: 'Advanced Colors', desc: 'Fine-tune colors for background, text, borders, and interactive elements' },
      ]
    },
    {
      category: 'Size & Dimensions',
      items: [
        { name: 'Launcher Size', desc: 'Adjust the floating button size (56px default, up to 100px)' },
        { name: 'Icon Scale', desc: 'Control the icon size inside the floating button (20% - 100%)' },
        { name: 'Widget Width/Height', desc: 'For embedded widgets, set custom dimensions' },
      ]
    },
    {
      category: 'Branding',
      items: [
        { name: 'Bot Name', desc: 'Display name shown in the chat header' },
        { name: 'Bot Icon', desc: 'Upload a custom icon/avatar for your bot' },
        { name: 'Bot Link', desc: 'Add a clickable link in the chat header' },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">⚙️ Customization Guide</h2>
        <p className="text-gray-700">Make your chatbot truly yours by customizing every visual aspect to match your brand.</p>
      </div>

      {options.map((section, idx) => (
        <div key={idx}>
          <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
            {section.category}
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {section.items.map((item, i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all">
                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200">
        <h3 className="font-bold text-indigo-900 mb-3">🎨 Design Tips</h3>
        <ul className="space-y-2 text-indigo-900 text-sm">
          <li>• <strong>Consistency:</strong> Use colors from your existing brand palette</li>
          <li>• <strong>Contrast:</strong> Ensure text is readable against background colors</li>
          <li>• <strong>Positioning:</strong> Place the widget where it won&apos;t cover important content</li>
          <li>• <strong>Testing:</strong> Preview on mobile devices before publishing</li>
          <li>• <strong>Iteration:</strong> Analyze user feedback and adjust design accordingly</li>
        </ul>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
        <p className="text-blue-800"><strong>🔄 Remember:</strong> Changes take effect immediately. Your users will see the updated widget on their next page load.</p>
      </div>
    </div>
  );
}

// Usage Analytics Section
function UsageSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">📊 Usage Analytics Dashboard</h2>
        <p className="text-gray-700">Monitor your chatbot&apos;s performance and user engagement metrics in real-time.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-4">📈 Key Metrics Explained</h3>
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="text-2xl">💬</div>
              <div>
                <h4 className="font-semibold text-gray-900">Total Conversations</h4>
                <p className="text-sm text-gray-700">The total number of chat sessions since your bot was deployed.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">✅</div>
              <div>
                <h4 className="font-semibold text-gray-900">Helpful Answers</h4>
                <p className="text-sm text-gray-700">Number of user responses marked as helpful. Higher = better bot quality.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">❌</div>
              <div>
                <h4 className="font-semibold text-gray-900">No Answer / Fallback</h4>
                <p className="text-sm text-gray-700">Messages the bot couldn&apos;t answer. Monitor this to improve your knowledge base.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">📊</div>
              <div>
                <h4 className="font-semibold text-gray-900">Avg Confidence</h4>
                <p className="text-sm text-gray-700">Average confidence level of bot responses. Target: 70%+</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">💰</div>
              <div>
                <h4 className="font-semibold text-gray-900">Cost Per Message</h4>
                <p className="text-sm text-gray-700">Your billing cost per message processed. Helps track expenses.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-l-4 border-green-500 pl-4 py-2">
          <h4 className="font-bold text-gray-900 mb-2">📅 Time Period Selection</h4>
          <p className="text-gray-700 mb-3">You can filter analytics by different time periods:</p>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• <strong>Last 7 days:</strong> Quick performance check</li>
            <li>• <strong>Last 30 days:</strong> Standard analytics view</li>
            <li>• <strong>Last 90 days:</strong> Identify long-term trends</li>
            <li>• <strong>Custom range:</strong> Compare specific periods</li>
          </ul>
        </div>

        <div className="border-l-4 border-purple-500 pl-4 py-2">
          <h4 className="font-bold text-gray-900 mb-2">🎯 What to Monitor</h4>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• <strong>Helpful answer rate:</strong> Aim for 80%+ over time</li>
            <li>• <strong>Conversation growth:</strong> Should increase as you improve your bot</li>
            <li>• <strong>Peak usage times:</strong> Understand when users engage most</li>
            <li>• <strong>Daily breakdown:</strong> See which days have highest activity</li>
          </ul>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded">
          <p className="text-amber-900"><strong>💡 Pro Tip:</strong> Export analytics data regularly and share with your team. Use insights to continuously improve your bot&apos;s knowledge base and responses.</p>
        </div>
      </div>
    </div>
  );
}

// Configuration Section
function ConfigSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">🔧 Configuration Page</h2>
        <p className="text-gray-700">The central hub for all your bot settings and integrations.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-lg font-bold text-green-900 mb-4">⚙️ Core Settings</h3>
          <div className="space-y-3">
            <div className="bg-white p-3 rounded border border-green-100">
              <h4 className="font-semibold text-gray-900">Bot Workspace</h4>
              <p className="text-sm text-gray-600 mt-1">ID, organization, and connection status. Read-only reference information.</p>
            </div>
            <div className="bg-white p-3 rounded border border-green-100">
              <h4 className="font-semibold text-gray-900">Assistant Type</h4>
              <p className="text-sm text-gray-600 mt-1">Type of bot you&apos;ve created (e.g., Appointment, Support, Sales). Determines available features.</p>
            </div>
            <div className="bg-white p-3 rounded border border-green-100">
              <h4 className="font-semibold text-gray-900">Template</h4>
              <p className="text-sm text-gray-600 mt-1">Pre-configured template your bot is based on. Affects system instructions and behaviors.</p>
            </div>
          </div>
        </div>

        <div className="border-l-4 border-blue-500 pl-4 py-2">
          <h4 className="font-bold text-gray-900 mb-2">🎨 Appearance Customization</h4>
          <p className="text-gray-700 text-sm mb-3">Customize how your widget looks. Access advanced color customization:</p>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>✓ Theme mode (Light/Dark/Auto)</li>
            <li>✓ Position on screen</li>
            <li>✓ Button and text colors</li>
            <li>✓ Size and border radius</li>
            <li>✓ Transparent button option</li>
            <li>✓ Icon scale adjustment</li>
          </ul>
        </div>

        <div className="border-l-4 border-purple-500 pl-4 py-2">
          <h4 className="font-bold text-gray-900 mb-2">🔗 Integrations</h4>
          <p className="text-gray-700 text-sm mb-3">Connect external services to extend functionality:</p>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>📅 <strong>Google Calendar:</strong> For scheduling and appointment management</li>
            <li>🔄 <strong>External APIs:</strong> Custom integrations using webhooks</li>
            <li>📊 <strong>Analytics Tools:</strong> Track bot performance</li>
          </ul>
        </div>

        <div className="bg-cyan-50 border border-cyan-200 p-4 rounded-lg">
          <h4 className="font-bold text-cyan-900 mb-2">🚀 Quick Actions</h4>
          <p className="text-cyan-900 text-sm mb-3">Perform common tasks directly from configuration:</p>
          <ul className="space-y-1 text-sm text-cyan-900">
            <li>📊 <strong>Analytics:</strong> View performance metrics</li>
            <li>🌐 <strong>Embed:</strong> Get embedding code for websites</li>
            <li>📋 <strong>Forms:</strong> Manage and create forms</li>
            <li>🏗️ <strong>Form Builder:</strong> Visual form designer</li>
          </ul>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
          <p className="text-blue-800"><strong>✨ Remember:</strong> Most changes apply immediately. For embedding code, regenerate if you change significant settings.</p>
        </div>
      </div>
    </div>
  );
}

// Form Links Section
function FormsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">📋 Form Links & Implementation</h2>
        <p className="text-gray-700">Use form links to collect user information and trigger specific bot behaviors.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg border border-orange-200">
          <h3 className="text-lg font-bold text-orange-900 mb-4">📚 Available Form Types</h3>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded border border-orange-100">
              <h4 className="font-semibold text-gray-900">📅 Appointment Booking Form</h4>
              <p className="text-sm text-gray-600 mt-2">URL: <code className="bg-gray-100 px-2 py-1 rounded text-xs">https://api.codeweft.in/api/form/appointment-booking</code></p>
              <p className="text-sm text-gray-700 mt-2"><strong>Purpose:</strong> Collect appointment details from users</p>
              <p className="text-sm text-gray-700"><strong>Fields:</strong> Date, time, name, email, phone, notes</p>
            </div>

            <div className="bg-white p-4 rounded border border-orange-100">
              <h4 className="font-semibold text-gray-900">📅 Appointment Reschedule Form</h4>
              <p className="text-sm text-gray-600 mt-2">URL: <code className="bg-gray-100 px-2 py-1 rounded text-xs">https://api.codeweft.in/api/form/reschedule</code></p>
              <p className="text-sm text-gray-700 mt-2"><strong>Purpose:</strong> Allow users to modify existing appointments</p>
              <p className="text-sm text-gray-700"><strong>Fields:</strong> Appointment ID, new date/time, reason</p>
            </div>

            <div className="bg-white p-4 rounded border border-orange-100">
              <h4 className="font-semibold text-gray-900">📅 Unified Appointment Portal</h4>
              <p className="text-sm text-gray-600 mt-2">URL: <code className="bg-gray-100 px-2 py-1 rounded text-xs">https://api.codeweft.in/api/appt</code></p>
              <p className="text-sm text-gray-700 mt-2"><strong>Purpose:</strong> Standalone portal supporting login-free booking and existing user modifications</p>
              <p className="text-sm text-gray-700"><strong>Features:</strong> Book, reschedule, cancel - all in one place</p>
            </div>
          </div>
        </div>

        <div className="border-l-4 border-green-500 pl-4 py-2">
          <h4 className="font-bold text-gray-900 mb-2">🔗 How to Use Form Links</h4>
          <ol className="space-y-2 text-gray-700 text-sm">
            <li><strong>1.</strong> Copy the form URL from the Form Links section</li>
            <li><strong>2.</strong> Share the link with users via email, chat, or website</li>
            <li><strong>3.</strong> Users fill the form and submit their information</li>
            <li><strong>4.</strong> Data is automatically saved and associated with your bot</li>
            <li><strong>5.</strong> View submissions in the Forms section</li>
          </ol>
        </div>

        <div className="border-l-4 border-blue-500 pl-4 py-2">
          <h4 className="font-bold text-gray-900 mb-2">💡 Implementation Methods</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Method 1 - Direct Link:</strong> Share the form URL directly with users</p>
            <p><strong>Method 2 - Embedded:</strong> Embed the form in your website using an iframe</p>
            <p><strong>Method 3 - Bot Response:</strong> The chatbot can send form links in conversations</p>
            <p><strong>Method 4 - QR Code:</strong> Create a QR code pointing to the form for easy mobile access</p>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
          <h4 className="font-bold text-purple-900 mb-2">📊 Form Analytics</h4>
          <p className="text-purple-900 text-sm mb-3">Track form submissions and engagement:</p>
          <ul className="space-y-1 text-sm text-purple-900">
            <li>✓ View all submitted form responses</li>
            <li>✓ See submission timestamps</li>
            <li>✓ Filter by form type</li>
            <li>✓ Export data for analysis</li>
            <li>✓ Monitor form abandonment rates</li>
          </ul>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
          <p className="text-blue-800"><strong>🔐 Security Note:</strong> All form submissions are secured and stored safely. User data is protected and complies with privacy regulations.</p>
        </div>
      </div>
    </div>
  );
}

// Form Builder Section
function FormBuilderSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">🏗️ Form Builder Guide</h2>
        <p className="text-gray-700">Create custom forms visually without writing code.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200">
          <h3 className="text-lg font-bold text-indigo-900 mb-4">🎯 Getting Started with Form Builder</h3>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="font-bold text-indigo-600 bg-indigo-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              <div>
                <p className="font-semibold text-gray-900">Navigate to Form Builder</p>
                <p className="text-sm text-gray-700">Go to Configuration → Form Builder in your dashboard</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-indigo-600 bg-indigo-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
              <div>
                <p className="font-semibold text-gray-900">Click &quot;Create New Form&quot;</p>
                <p className="text-sm text-gray-700">Start with a blank form or use a template</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-indigo-600 bg-indigo-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
              <div>
                <p className="font-semibold text-gray-900">Add Form Fields</p>
                <p className="text-sm text-gray-700">Drag and drop fields from the left panel</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-indigo-600 bg-indigo-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
              <div>
                <p className="font-semibold text-gray-900">Configure Fields</p>
                <p className="text-sm text-gray-700">Set field names, types, labels, and validation rules</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-indigo-600 bg-indigo-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">5</span>
              <div>
                <p className="font-semibold text-gray-900">Customize Appearance</p>
                <p className="text-sm text-gray-700">Set colors, fonts, spacing to match your brand</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-indigo-600 bg-indigo-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">6</span>
              <div>
                <p className="font-semibold text-gray-900">Publish & Share</p>
                <p className="text-sm text-gray-700">Get a shareable link and start collecting data</p>
              </div>
            </li>
          </ol>
        </div>

        <div className="border-l-4 border-green-500 pl-4 py-2">
          <h4 className="font-bold text-gray-900 mb-2">📝 Available Field Types</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="text-sm text-gray-700">
              <p>✓ <strong>Text Input</strong> - Single line text</p>
              <p>✓ <strong>Text Area</strong> - Multi-line text</p>
              <p>✓ <strong>Email</strong> - Email validation</p>
              <p>✓ <strong>Phone</strong> - Phone number</p>
              <p>✓ <strong>Number</strong> - Numeric input</p>
              <p>✓ <strong>Date</strong> - Date picker</p>
            </div>
            <div className="text-sm text-gray-700">
              <p>✓ <strong>Time</strong> - Time picker</p>
              <p>✓ <strong>Dropdown</strong> - Select from options</p>
              <p>✓ <strong>Checkbox</strong> - Multiple selections</p>
              <p>✓ <strong>Radio Button</strong> - Single selection</p>
              <p>✓ <strong>File Upload</strong> - Document attachment</p>
              <p>✓ <strong>Hidden Field</strong> - Store data invisibly</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-bold text-blue-900 mb-2">⚙️ Field Configuration Options</h4>
          <ul className="space-y-2 text-sm text-blue-900">
            <li>• <strong>Label:</strong> Display text for the field</li>
            <li>• <strong>Placeholder:</strong> Hint text inside the input</li>
            <li>• <strong>Required:</strong> Make field mandatory or optional</li>
            <li>• <strong>Validation Rules:</strong> Set min/max length, regex patterns</li>
            <li>• <strong>Default Value:</strong> Pre-fill with initial value</li>
            <li>• <strong>Help Text:</strong> Additional instructions below the field</li>
            <li>• <strong>Options (for dropdowns):</strong> Add choices for selection</li>
          </ul>
        </div>

        <div className="border-l-4 border-purple-500 pl-4 py-2">
          <h4 className="font-bold text-gray-900 mb-2">🎨 Styling Your Form</h4>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• <strong>Colors:</strong> Customize background, text, accent colors</li>
            <li>• <strong>Layout:</strong> Single column, two columns, or custom grid</li>
            <li>• <strong>Spacing:</strong> Adjust padding and margins</li>
            <li>• <strong>Font Size:</strong> Choose readable sizes for all elements</li>
            <li>• <strong>Button Style:</strong> Customize submit button appearance</li>
            <li>• <strong>Conditional Visibility:</strong> Show/hide fields based on responses</li>
          </ul>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded">
          <p className="text-amber-900"><strong>💡 Pro Tip:</strong> Test your form on mobile before publishing. Use conditional logic to show only relevant fields based on user input, improving the user experience.</p>
        </div>
      </div>
    </div>
  );
}

// Calendar Section
function CalendarSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">📅 Google Calendar Integration</h2>
        <p className="text-gray-700">Seamlessly sync your chatbot with Google Calendar for appointment management.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg border border-red-200">
          <h3 className="text-lg font-bold text-red-900 mb-4">🔗 Setup Instructions</h3>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="font-bold text-red-600 bg-red-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              <div>
                <p className="font-semibold text-gray-900">Open Configuration Page</p>
                <p className="text-sm text-gray-700">Navigate to your bot workspace settings</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-red-600 bg-red-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
              <div>
                <p className="font-semibold text-gray-900">Find Integrations Section</p>
                <p className="text-sm text-gray-700">Look for &quot;Google Calendar&quot; under Integrations</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-red-600 bg-red-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
              <div>
                <p className="font-semibold text-gray-900">Click &quot;Connect Calendar&quot;</p>
                <p className="text-sm text-gray-700">You&apos;ll be redirected to Google login</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-red-600 bg-red-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
              <div>
                <p className="font-semibold text-gray-900">Authorize CodeWeft</p>
                <p className="text-sm text-gray-700">Grant permission to access your calendar</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-red-600 bg-red-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">5</span>
              <div>
                <p className="font-semibold text-gray-900">Select Calendar</p>
                <p className="text-sm text-gray-700">Choose which Google Calendar to connect</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-red-600 bg-red-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">6</span>
              <div>
                <p className="font-semibold text-gray-900">Verify Connection</p>
                <p className="text-sm text-gray-700">You&apos;ll see &quot;Calendar Connected&quot; confirmation</p>
              </div>
            </li>
          </ol>
        </div>

        <div className="border-l-4 border-blue-500 pl-4 py-2">
          <h4 className="font-bold text-gray-900 mb-2">✨ What the Integration Does</h4>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>✓ <strong>Check Availability:</strong> Bot automatically checks your calendar availability</li>
            <li>✓ <strong>Suggest Time Slots:</strong> Shows users only available time slots</li>
            <li>✓ <strong>Create Events:</strong> Automatically creates calendar events for bookings</li>
            <li>✓ <strong>Send Reminders:</strong> Calendar sends reminders to attendees</li>
            <li>✓ <strong>Sync Cancellations:</strong> Cancelled appointments are removed from calendar</li>
            <li>✓ <strong>Real-time Updates:</strong> Changes reflect immediately</li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-bold text-green-900 mb-2">🔧 Calendar Configuration</h4>
          <p className="text-green-900 text-sm mb-3">Once connected, configure these settings:</p>
          <ul className="space-y-2 text-sm text-green-900">
            <li>🕐 <strong>Available Hours:</strong> Set when appointments can be booked</li>
            <li>⏱️ <strong>Timeslot Duration:</strong> Duration of each appointment (30min, 1hr, etc.)</li>
            <li>🚫 <strong>Buffer Time:</strong> Gap between appointments (for preparation)</li>
            <li>📅 <strong>Days Available:</strong> Which days users can book (weekdays, weekends, etc.)</li>
            <li>🔔 <strong>Notifications:</strong> Get alerts for new bookings</li>
            <li>📧 <strong>Timezone:</strong> Set correct timezone for your business</li>
          </ul>
        </div>

        <div className="border-l-4 border-purple-500 pl-4 py-2">
          <h4 className="font-bold text-gray-900 mb-2">👤 User Experience</h4>
          <p className="text-gray-700 text-sm mb-3">When users interact with appointment scheduling:</p>
          <ol className="space-y-2 text-gray-700 text-sm">
            <li>1. User requests to book an appointment in chat</li>
            <li>2. Bot checks your calendar for available slots</li>
            <li>3. User selects preferred date and time</li>
            <li>4. Bot confirms and creates calendar event</li>
            <li>5. Confirmation is sent to user&apos;s email</li>
            <li>6. Calendar reminder is set automatically</li>
          </ol>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded">
          <h4 className="font-bold text-amber-900 mb-2">⚠️ Important Considerations</h4>
          <ul className="space-y-2 text-amber-900 text-sm">
            <li>• <strong>Timezone Matching:</strong> Ensure your bot timezone matches your calendar timezone</li>
            <li>• <strong>Calendar Privacy:</strong> Use a dedicated calendar for appointments if possible</li>
            <li>• <strong>Sync Delay:</strong> There may be a slight delay (seconds) between booking and calendar update</li>
            <li>• <strong>Manual Edits:</strong> Be careful when manually editing calendar events - sync inconsistencies may occur</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h4 className="font-bold text-blue-900 mb-2">🚀 Advanced Features</h4>
          <ul className="space-y-2 text-sm text-blue-900">
            <li>✓ <strong>Multiple Calendars:</strong> Connect multiple calendars for different services</li>
            <li>✓ <strong>Color Coding:</strong> Assign colors to different appointment types</li>
            <li>✓ <strong>Recurring Availability:</strong> Set up repeating time slots</li>
            <li>✓ <strong>Auto-Cancellation:</strong> Let users cancel appointments directly from the bot</li>
            <li>✓ <strong>Rescheduling:</strong> Allow users to move appointments to different times</li>
          </ul>
        </div>

        <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
          <p className="text-green-800"><strong>✅ Verification:</strong> After connecting, visit the &quot;Connected Calendar Details&quot; section to verify the calendar is synced. You&apos;ll see the calendar name and last sync timestamp.</p>
        </div>
      </div>
    </div>
  );
}
