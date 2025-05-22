'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'buying' | 'selling' | 'account';
}

const faqs: FAQItem[] = [
  {
    question: 'What is BookMarket?',
    answer: 'BookMarket is an online marketplace where you can buy and sell books. It connects book lovers and helps them find their next read or sell books they no longer need.',
    category: 'general'
  },
  {
    question: 'How do I create an account?',
    answer: 'You can create an account by clicking the "Sign Up" button in the top right corner. You can sign up using your email or Google account.',
    category: 'account'
  },
  {
    question: 'How do I list a book for sale?',
    answer: 'After signing in, click "Sell a Book" in the navigation menu. Fill out the book details, upload photos, and set your price. Make sure to provide accurate information about the book\'s condition.',
    category: 'selling'
  },
  {
    question: 'How do I buy a book?',
    answer: 'Browse the available books, click on one you\'re interested in, and use the contact information to reach out to the seller. Arrange a meeting or delivery method that works for both parties.',
    category: 'buying'
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We recommend using secure payment methods like cash on delivery, bank transfers, or digital payment apps. Always verify the book\'s condition before making the payment.',
    category: 'buying'
  },
  {
    question: 'How do I update my profile?',
    answer: 'Go to your dashboard and click on "Edit Profile" to update your information, including your name, email, and profile picture.',
    category: 'account'
  },
  {
    question: 'What should I do if I receive a damaged book?',
    answer: 'Contact the seller immediately and document the damage with photos. If you can\'t resolve the issue with the seller, contact our support team for assistance.',
    category: 'buying'
  },
  {
    question: 'How do I delete my account?',
    answer: 'Go to your account settings and click on "Delete Account". Please note that this action is permanent and cannot be undone.',
    category: 'account'
  },
  {
    question: 'What are the fees for selling books?',
    answer: 'Currently, BookMarket is free to use. There are no listing fees or commission charges for selling books.',
    category: 'selling'
  },
  {
    question: 'How do I report a problem?',
    answer: 'You can report issues through the Contact Us page or email support@bookmarket.com. Our team will assist you as soon as possible.',
    category: 'general'
  }
];

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState<'all' | FAQItem['category']>('all');
  const [openQuestions, setOpenQuestions] = useState<Set<string>>(new Set());

  const toggleQuestion = (question: string) => {
    const newOpenQuestions = new Set(openQuestions);
    if (newOpenQuestions.has(question)) {
      newOpenQuestions.delete(question);
    } else {
      newOpenQuestions.add(question);
    }
    setOpenQuestions(newOpenQuestions);
  };

  const filteredFaqs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Find answers to common questions about using BookMarket
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveCategory('general')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeCategory === 'general'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveCategory('buying')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeCategory === 'buying'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Buying
          </button>
          <button
            onClick={() => setActiveCategory('selling')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeCategory === 'selling'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Selling
          </button>
          <button
            onClick={() => setActiveCategory('account')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeCategory === 'account'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Account
          </button>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              <button
                onClick={() => toggleQuestion(faq.question)}
                className="w-full px-6 py-4 text-left focus:outline-none"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {faq.question}
                  </h3>
                  <svg
                    className={`h-5 w-5 text-gray-500 transform transition-transform ${
                      openQuestions.has(faq.question) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
              {openQuestions.has(faq.question) && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still Have Questions? */}
        <div className="mt-12 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Still Have Questions?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
} 