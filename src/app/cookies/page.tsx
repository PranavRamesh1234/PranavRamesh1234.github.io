export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Cookie Policy</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">What Are Cookies</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide a better user experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">How We Use Cookies</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Essential Cookies</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas of the website.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Preference Cookies</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  These cookies enable the website to remember information that changes the way the website behaves or looks, like your preferred language or region.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Analytics Cookies</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Types of Cookies We Use</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Session Cookies</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  These are temporary cookies that expire when you close your browser. They are used to maintain your session while you browse the website.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Persistent Cookies</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  These cookies remain on your device for a set period of time or until you delete them. They are used to remember your preferences and settings.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Third-Party Cookies</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Some cookies are placed by third-party services that appear on our pages. We use the following third-party services:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
              <li>Google Analytics for website analytics</li>
              <li>Authentication services for user login</li>
              <li>Payment processors for transactions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Managing Cookies</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              To learn more about cookies and how to manage them, visit <a href="https://www.aboutcookies.org" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">aboutcookies.org</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Changes to This Policy</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-400">
              If you have any questions about our Cookie Policy, please contact us at privacy@bookmarket.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
} 