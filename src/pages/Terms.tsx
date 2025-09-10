import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Terms and Conditions
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="mt-12 prose prose-indigo prose-lg text-gray-500 mx-auto">
          <h2>1. Introduction</h2>
          <p>
            Welcome to StudentZenith. These terms and conditions outline the rules and regulations for the use of StudentZenith's Website, located at studentzenith.com.
          </p>
          <p>
            By accessing this website, we assume you accept these terms and conditions. Do not continue to use StudentZenith if you do not agree to take all of the terms and conditions stated on this page.
          </p>

          <h2>2. Intellectual Property Rights</h2>
          <p>
            Other than the content you own, under these Terms, StudentZenith and/or its licensors own all the intellectual property rights and materials contained in this Website. You are granted limited license only for purposes of viewing the material contained on this Website.
          </p>

          <h2>3. Restrictions</h2>
          <p>You are specifically restricted from all of the following:</p>
          <ul>
            <li>Publishing any Website material in any other media</li>
            <li>Selling, sublicensing and/or otherwise commercializing any Website material</li>
            <li>Publicly performing and/or showing any Website material</li>
            <li>Using this Website in any way that is or may be damaging to this Website</li>
            <li>Using this Website in any way that impacts user access to this Website</li>
            <li>Using this Website contrary to applicable laws and regulations</li>
          </ul>

          <h2>4. Your Content</h2>
          <p>
            In these Website Standard Terms and Conditions, "Your Content" shall mean any audio, video text, images or other material you choose to display on this Website. By displaying Your Content, you grant StudentZenith a non-exclusive, worldwide, irrevocable, sub-licensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media.
          </p>

          <h2>5. Privacy Policy</h2>
          <p>
            Please read our <Link to="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link> which also governs your use of our services and explains how we collect, use, and disclose your personal information.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            In no event shall StudentZenith, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. StudentZenith, including its officers, directors, and employees shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this Website.
          </p>

          <h2>7. Indemnification</h2>
          <p>
            You hereby indemnify to the fullest extent StudentZenith from and against any and/or all liabilities, costs, demands, causes of action, damages and expenses arising in any way related to your breach of any of the provisions of these Terms.
          </p>

          <h2>8. Severability</h2>
          <p>
            If any provision of these Terms is found to be invalid under any applicable law, such provisions shall be deleted without affecting the remaining provisions herein.
          </p>

          <h2>9. Variation of Terms</h2>
          <p>
            StudentZenith is permitted to revise these Terms at any time as it sees fit, and by using this Website you are expected to review these Terms on a regular basis.
          </p>

          <h2>10. Governing Law & Jurisdiction</h2>
          <p>
            These Terms will be governed by and interpreted in accordance with the laws of the State of California, and you submit to the non-exclusive jurisdiction of the state and federal courts located in California for the resolution of any disputes.
          </p>

          <h2>11. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at <a href="mailto:legal@studentzenith.com" className="text-indigo-600 hover:underline">legal@studentzenith.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
