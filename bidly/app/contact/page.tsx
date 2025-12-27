"use client";

export const dynamic = 'force-dynamic';

import Link from "next/link";
import { Zap, Mail, ArrowLeft } from "lucide-react";

export default function ContactPage() {
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
            <h1 className="text-3xl sm:text-4xl font-bold">Contact Us</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Have a question or need help? We'd love to hear from you.
          </p>
        </div>

        {/* Contact Card */}
        <div className="bg-card border border-border rounded-2xl p-8 sm:p-12 shadow-lg">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold mb-2">Get in Touch</h2>
              <p className="text-muted-foreground mb-6">
                Send us an email and we'll get back to you as soon as possible.
              </p>
            </div>

            <div className="space-y-4">
              <a
                href="mailto:danielmajos4@gmail.com"
                className="inline-flex items-center gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-lg font-medium"
              >
                <Mail className="w-5 h-5" />
                danielmajos4@gmail.com
              </a>
              
              <p className="text-sm text-muted-foreground">
                Click the button above or copy the email address to your email client
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="bg-muted/30 rounded-xl p-6">
            <h3 className="font-semibold mb-2">Response Time</h3>
            <p className="text-sm text-muted-foreground">
              We typically respond within 24-48 hours during business days.
            </p>
          </div>
          
          <div className="bg-muted/30 rounded-xl p-6">
            <h3 className="font-semibold mb-2">Support</h3>
            <p className="text-sm text-muted-foreground">
              For technical issues or feature requests, please include as much detail as possible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

