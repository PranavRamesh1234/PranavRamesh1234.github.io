export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Introduction</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              At BookMarket, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Please read this privacy policy carefully. By using our services, you consent to the practices described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Personal Information</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-400">
                  <li>Name and contact information</li>
                  <li>Email address</li>
                  <li>Profile information</li>
                  <li>Payment information (if applicable)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Usage Information</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We automatically collect certain information about your device and how you interact with our website, including:
                </p>
                <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-400">
                  <li>IP address</li>
                  <li>Browser type</li>
                  <li>Operating system</li>
                  <li>Pages visited</li>
                  <li>Time and date of visits</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">How We Use Your Information</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Communicate with you about products, services, and events</li>
              <li>Monitor and analyze trends and usage</li>
              <li>Detect, prevent, and address technical issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Information Sharing</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We may share your information with:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
              <li>Service providers who perform services on our behalf</li>
              <li>Other users when you choose to share information</li>
              <li>Law enforcement when required by law</li>
              <li>Business partners with your consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Your Rights</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Object to processing of your information</li>
              <li>Request restriction of processing</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Security</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-400">
              If you have any questions about this Privacy Policy, please contact us at privacy@bookmarket.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
} 