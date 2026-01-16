"use client";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none dark:text-gray-300 text-gray-800">
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
          <p>
            CodeWeft (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;, or &quot;Company&quot;) operates the chatbot platform and services available at chatbot.codeweft.in (the &quot;Service&quot;). 
            This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service. 
            For more information about CodeWeft, visit our main website at <a href="https://www.codeweft.in" className="text-blue-600 hover:text-blue-700 underline">www.codeweft.in</a>.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Types of Data Collected</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Personal Data</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Email address</li>
            <li>Name</li>
            <li>Organization information</li>
            <li>Profile information you provide</li>
            <li>Chat interactions and conversations</li>
            <li>Calendar data (when connected to Google Calendar)</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Usage Data</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Pages visited and time spent</li>
            <li>Device information</li>
            <li>Referring/exit pages</li>
            <li>Click stream data</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Use of Data</h2>
          <p>CodeWeft uses the collected data for various purposes:</p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>To provide and maintain our Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To allow you to participate in interactive features of our Service</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information to improve our Service</li>
            <li>To monitor the usage of our Service</li>
            <li>To detect, prevent and address technical issues and fraud</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Security of Data</h2>
          <p>
            The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. 
            While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Google Calendar Integration</h2>
          <p>
            When you connect your Google Calendar to our Service, we only access the permissions necessary to:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>View and manage your calendar events</li>
            <li>Create new calendar events based on chatbot conversations</li>
            <li>Update existing calendar events</li>
          </ul>
          <p>
            Your Google credentials are encrypted and securely stored. We do not share your calendar data with third parties without your consent.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Third-Party Services</h2>
          <p>
            Our Service may contain links to other sites that are not operated by us. This Privacy Policy does not apply to third-party websites, 
            and we are not responsible for their privacy practices. We encourage you to review the privacy policies of any third-party service before providing your information.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Children&apos;s Privacy</h2>
          <p>
            Our Service does not address anyone under the age of 18 (&quot;Children&quot;). We do not knowingly collect personally identifiable information from anyone under 18. 
            If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us immediately.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page 
            and updating the &quot;effective date&quot; at the bottom of this Privacy Policy.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <div className="mt-4 p-4 bg-gray-100 dark:bg-slate-800 rounded">
            <p className="font-semibold">CodeWeft Inc.</p>
            <p>Email: <a href="mailto:codeweft.ai@gmail.com" className="text-blue-600 hover:text-blue-700 underline">codeweft.ai@gmail.com</a></p>
            <p>Website: <a href="https://www.codeweft.in" className="text-blue-600 hover:text-blue-700 underline">https://www.codeweft.in</a></p>
            <p>Chatbot Platform: <a href="https://chatbot.codeweft.in" className="text-blue-600 hover:text-blue-700 underline">https://chatbot.codeweft.in</a></p>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-8">
            Last updated: January 14, 2026
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
