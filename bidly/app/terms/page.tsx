"use client";

export const dynamic = 'force-dynamic';

import Link from "next/link";
import { Zap, ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
            <h1 className="text-3xl sm:text-4xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-card border border-border rounded-2xl p-8 sm:p-12 shadow-lg prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground mb-4">
              By accessing or using Bidly ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
            </p>
            <p className="text-muted-foreground">
              These Terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground mb-4">
              Bidly is an AI-powered platform that helps freelancers generate personalized proposals and profiles for freelance platforms such as Upwork, Fiverr, and others. The Service uses artificial intelligence to create customized content based on user-provided information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Account Creation</h3>
            <p className="text-muted-foreground mb-4">
              To use the Service, you must create an account by providing accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Account Restrictions</h3>
            <p className="text-muted-foreground mb-4">
              <strong>One Account Per User:</strong> Each user is limited to one account per device/browser. Creating multiple accounts to bypass usage limits or gain unfair advantages is strictly prohibited.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Account Responsibility:</strong> You are responsible for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.
            </p>
            <p className="text-muted-foreground">
              <strong>Account Termination:</strong> We reserve the right to suspend or terminate accounts that violate these Terms, including accounts created to circumvent usage limits.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Free Tier and Usage Limits</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Free Tier Limitations</h3>
            <p className="text-muted-foreground mb-4">
              The free tier includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>10 proposals per month</strong> - Reset monthly based on your account creation date</li>
              <li><strong>2 profile generations per month</strong> - Reset monthly based on your account creation date</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Prohibited Activities</h3>
            <p className="text-muted-foreground mb-4">
              The following activities are strictly prohibited:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Creating multiple accounts to exceed free tier limits</li>
              <li>Using different email addresses, browsers, or devices to create additional accounts</li>
              <li>Sharing accounts with others to bypass individual usage limits</li>
              <li>Attempting to circumvent or bypass usage restrictions through any means</li>
              <li>Using automated tools or scripts to generate content beyond your allocated limits</li>
            </ul>
            <p className="text-muted-foreground">
              Violation of these restrictions may result in immediate account termination and permanent ban from the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
            <p className="text-muted-foreground mb-4">
              You agree not to use the Service:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
              <li>To upload or transmit viruses or any other type of malicious code</li>
              <li>To collect or track the personal information of others</li>
              <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
              <li>For any obscene or immoral purpose</li>
              <li>To interfere with or circumvent the security features of the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Content and Intellectual Property</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Your Content</h3>
            <p className="text-muted-foreground mb-4">
              You retain ownership of any content you submit to the Service. By submitting content, you grant us a license to use, modify, and display such content solely for the purpose of providing the Service.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Generated Content</h3>
            <p className="text-muted-foreground mb-4">
              Content generated by our AI is provided for your use. You are responsible for reviewing, editing, and ensuring the accuracy and appropriateness of all generated content before using it.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">6.3 Our Intellectual Property</h3>
            <p className="text-muted-foreground">
              The Service and its original content, features, and functionality are owned by Bidly and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Service Availability</h2>
            <p className="text-muted-foreground mb-4">
              We reserve the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Modify or discontinue the Service at any time without notice</li>
              <li>Change usage limits, features, or pricing</li>
              <li>Perform maintenance that may temporarily interrupt service</li>
              <li>Refuse service to anyone for any reason at any time</li>
            </ul>
            <p className="text-muted-foreground">
              We do not guarantee that the Service will be available at all times or that it will be error-free or uninterrupted.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
            <p className="text-muted-foreground">
              We do not warrant that the Service will be uninterrupted, secure, or error-free, or that defects will be corrected. We do not warrant or make any representations regarding the use or results of the use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL BIDLY, ITS DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
            </p>
            <p className="text-muted-foreground">
              Our total liability for any claims arising from or related to the Service shall not exceed the amount you paid us in the twelve (12) months preceding the claim, or $100, whichever is greater.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
            <p className="text-muted-foreground mb-4">
              You agree to defend, indemnify, and hold harmless Bidly and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including without limitation reasonable attorney's fees and costs, arising out of or in any way connected with your access to or use of the Service, your violation of these Terms, or your violation of any third-party right.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
            <p className="text-muted-foreground mb-4">
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms.
            </p>
            <p className="text-muted-foreground mb-4">
              Upon termination, your right to use the Service will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive termination, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>
            <p className="text-muted-foreground">
              You may terminate your account at any time by contacting us or using the account deletion feature in your settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
            <p className="text-muted-foreground mb-4">
              These Terms shall be governed by and construed in accordance with applicable laws, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
            <p className="text-muted-foreground mb-4">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
            </p>
            <p className="text-muted-foreground">
              What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about these Terms of Service, please contact us at:
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

