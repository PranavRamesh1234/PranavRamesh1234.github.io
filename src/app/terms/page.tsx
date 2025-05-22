export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-600 dark:text-gray-400">
              By accessing or using BookMarket, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Use License</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Permission is granted to temporarily use BookMarket for personal, non-commercial purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to decompile or reverse engineer any software contained on BookMarket</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. User Accounts</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              To use certain features of BookMarket, you must register for an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Promptly update any changes to your information</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Listing and Selling Books</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              When listing books for sale, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
              <li>Provide accurate descriptions and conditions</li>
              <li>Upload clear, relevant photos</li>
              <li>Set fair and reasonable prices</li>
              <li>Respond promptly to buyer inquiries</li>
              <li>Complete transactions as agreed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Prohibited Activities</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Post false or misleading information</li>
              <li>Harass or abuse other users</li>
              <li>Use the service for any illegal purposes</li>
              <li>Attempt to gain unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Disclaimer</h2>
            <p className="text-gray-600 dark:text-gray-400">
              BookMarket is provided "as is" without any warranties, expressed or implied. We do not guarantee the accuracy, completeness, or reliability of any content or listings on the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-400">
              In no event shall BookMarket be liable for any damages arising out of the use or inability to use our services, including but not limited to direct, indirect, incidental, or consequential damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Changes to Terms</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms of Service on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Contact Information</h2>
            <p className="text-gray-600 dark:text-gray-400">
              If you have any questions about these Terms of Service, please contact us at terms@bookmarket.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
} 