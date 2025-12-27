"use client";

export const dynamic = 'force-dynamic';

import Link from "next/link";
import { Zap, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-card border border-border rounded-2xl p-8 sm:p-12 shadow-lg prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground mb-4">
              Welcome to Bidly ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
            </p>
            <p className="text-muted-foreground">
              By using Bidly, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Account Information</h3>
            <p className="text-muted-foreground mb-4">
              When you create an account, we collect:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Email address</li>
              <li>Name (if provided)</li>
              <li>Profile picture (if provided)</li>
              <li>Authentication credentials managed by Clerk</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Profile Information</h3>
            <p className="text-muted-foreground mb-4">
              During onboarding, you may provide:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Profession and skills</li>
              <li>Experience level</li>
              <li>Writing style preferences</li>
              <li>Platform preferences (Upwork, Fiverr, etc.)</li>
              <li>Portfolio links</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Usage Data</h3>
            <p className="text-muted-foreground mb-4">
              We automatically collect information about how you use our service:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Proposals generated and their content</li>
              <li>Profiles created</li>
              <li>Usage statistics (number of proposals/profiles used)</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>IP address</li>
              <li>Access times and dates</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.4 Cookies and Local Storage</h3>
            <p className="text-muted-foreground mb-4">
              We use cookies and local storage to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Maintain your session</li>
              <li>Store your preferences</li>
              <li>Prevent abuse and ensure fair usage</li>
              <li>Improve our service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the collected information for various purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Service Delivery:</strong> To generate personalized proposals and profiles based on your input</li>
              <li><strong>Account Management:</strong> To create and manage your account, track usage limits, and provide customer support</li>
              <li><strong>Service Improvement:</strong> To analyze usage patterns and improve our AI models and features</li>
              <li><strong>Security:</strong> To detect and prevent fraud, abuse, and unauthorized access</li>
              <li><strong>Communication:</strong> To send you service-related notifications and respond to your inquiries</li>
              <li><strong>Compliance:</strong> To comply with legal obligations and enforce our Terms of Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
            <p className="text-muted-foreground mb-4">
              Your data is stored securely using Convex, a modern database platform. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <p className="text-muted-foreground mb-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
            <p className="text-muted-foreground mb-4">
              We use the following third-party services that may have access to your information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Clerk:</strong> For authentication and user management. Their privacy policy applies to authentication data.</li>
              <li><strong>Convex:</strong> For database and backend services. Your data is stored securely on their platform.</li>
              <li><strong>AI Providers:</strong> We use AI services to generate proposals and profiles. Your input data may be processed by these services.</li>
            </ul>
            <p className="text-muted-foreground">
              These third parties have access to your information only to perform tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Free Tier Limitations and Account Restrictions</h2>
            <p className="text-muted-foreground mb-4">
              To ensure fair usage and prevent abuse:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Free tier users are limited to <strong>10 proposals per month</strong> and <strong>2 profile generations per month</strong></li>
              <li>Each user is limited to <strong>one account per device/browser</strong></li>
              <li>We use browser fingerprinting and device identification to prevent multiple account creation</li>
              <li>Creating multiple accounts to bypass usage limits is strictly prohibited and may result in account termination</li>
              <li>Usage limits reset monthly based on your account creation date</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct your personal information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
              <li><strong>Portability:</strong> Request your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from non-essential communications</li>
            </ul>
            <p className="text-muted-foreground">
              To exercise these rights, please contact us at <a href="mailto:danielmajos4@gmail.com" className="text-primary hover:underline">danielmajos4@gmail.com</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
            <p className="text-muted-foreground mb-4">
              We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. When you delete your account, we will delete or anonymize your personal data, except where we are required to retain it for legal or regulatory purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
            <p className="text-muted-foreground mb-4">
              Our service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-muted-foreground">
              Email: <a href="mailto:danielmajos4@gmail.com" className="text-primary hover:underline">danielmajos4@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

