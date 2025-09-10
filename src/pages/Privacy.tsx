import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="mt-12 prose prose-indigo prose-lg text-gray-500 mx-auto">
          <p>
            At StudentZenith, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website studentzenith.com.
          </p>

          <h2>1. Information We Collect</h2>
          <p>We collect several types of information from and about users of our Website, including:</p>
          <ul>
            <li>Personal data (name, email address, etc.)</li>
            <li>Usage data (pages visited, time spent, etc.)</li>
            <li>Cookies and tracking technologies</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect for various purposes, including to:</p>
          <ul>
            <li>Provide, operate, and maintain our website</li>
            <li>Improve, personalize, and expand our website</li>
            <li>Understand and analyze how you use our website</li>
            <li>Develop new products, services, features, and functionality</li>
            <li>Communicate with you for customer service and updates</li>
          </ul>

          <h2>3. Data Protection</h2>
          <p>
            We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2>4. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our website and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>

          <h2>5. Third-Party Services</h2>
          <p>
            We may employ third-party companies and individuals to facilitate our website, provide services, or analyze how our website is used. These third parties have access to your personal information only to perform these tasks on our behalf.
          </p>

          <h2>6. Children's Privacy</h2>
          <p>
            Our service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13.
          </p>

          <h2>7. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>

          <h2>8. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@studentzenith.com" className="text-indigo-600 hover:underline">privacy@studentzenith.com</a>.
          </p>

          <div className="mt-8 border-t border-gray-200 pt-8">
            <p className="text-sm text-gray-500">
              For more information about our privacy practices, or if you have questions, please contact us as described above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
