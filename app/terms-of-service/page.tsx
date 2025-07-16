import React from 'react';

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="text-gray-600 mb-4">
            Welcome to EZY Interview. By accessing or using our website and services, you agree to be bound by these Terms of Service. Please read them carefully.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Definitions</h2>
          <p className="text-gray-600 mb-4">
            &quot;Service&quot; refers to the EZY Interview platform, including all features, functionalities, and user interfaces.
            &quot;User&quot; refers to any individual or entity that accesses or uses the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Use of Service</h2>
          <p className="text-gray-600 mb-4">
            Our Service is designed to help users prepare for interviews through AI-powered tools and resources. Users must:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Be at least 18 years old to use the Service</li>
            <li>Provide accurate and complete information when creating an account</li>
            <li>Maintain the security of their account credentials</li>
            <li>Use the Service in compliance with all applicable laws and regulations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Subscription and Payments</h2>
          <p className="text-gray-600 mb-4">
            We offer various subscription tiers with different features and pricing. By subscribing to a paid plan:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>You agree to pay all fees associated with your chosen subscription plan</li>
            <li>Subscriptions will automatically renew unless cancelled</li>
            <li>Refunds are handled in accordance with our refund policy</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
          <p className="text-gray-600 mb-4">
            All content, features, and functionality of the Service are owned by EZY Interview and are protected by international copyright, trademark, and other intellectual property laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Privacy</h2>
          <p className="text-gray-600 mb-4">
            Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms of Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
          <p className="text-gray-600 mb-4">
            We reserve the right to terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms of Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
          <p className="text-gray-600 mb-4">
            We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
          <p className="text-gray-600 mb-4">
            If you have any questions about these Terms, please contact us at support@ezyinterview.com
          </p>
        </section>

        <div className="text-sm text-gray-500 mt-8">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 