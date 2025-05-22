export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Help Center</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Find answers to common questions and learn how to use BookMarket
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-8">
          {/* Getting Started */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Getting Started</h2>
            <div className="space-y-4">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">How do I create an account?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Click the "Sign Up" button in the top right corner. You can sign up using your email or Google account.
                </p>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">How do I list a book for sale?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  After signing in, click "Sell a Book" in the navigation menu. Fill out the book details, upload photos, and set your price.
                </p>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">How do I buy a book?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Browse the available books, click on one you're interested in, and use the contact information to reach out to the seller.
                </p>
              </div>
            </div>
          </section>

          {/* Account Management */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Account Management</h2>
            <div className="space-y-4">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">How do I update my profile?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Go to your dashboard and click on "Edit Profile" to update your information.
                </p>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">How do I change my password?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Visit your account settings and click on "Change Password" to update your password.
                </p>
              </div>
            </div>
          </section>

          {/* Safety & Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Safety & Security</h2>
            <div className="space-y-4">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">How do I stay safe when buying/selling?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Always meet in public places, verify the book's condition before purchasing, and use secure payment methods.
                </p>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">What should I do if I encounter a problem?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Contact our support team immediately through the Contact Us page or email support@bookmarket.com.
                </p>
              </div>
            </div>
          </section>

          {/* Still Need Help? */}
          <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Still Need Help?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Contact Support
            </a>
          </section>
        </div>
      </div>
    </div>
  );
} 