'use client';

import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';

interface BuyerInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  buyer: {
    id: string;
    full_name: string | null;
    email: string;
    location: string | null;
    created_at: string;
    updated_at: string;
  };
}

export default function BuyerInfoDialog({ isOpen, onClose, buyer }: BuyerInfoDialogProps) {
  const [message, setMessage] = useState('');
  const [showMessageBox, setShowMessageBox] = useState(false);

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) {
      return 'N/A';
    }
    
    try {
      const date = parseISO(dateString);
      return format(date, 'd MMMM yyyy');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const handleEmailClick = () => {
    const formattedMessage = message.replace(/\n/g, '%0A');
    const mailtoLink = document.createElement('a');
    mailtoLink.href = `mailto:${buyer.email}?subject=${encodeURIComponent('Regarding your book request')}&body=${encodeURIComponent(formattedMessage)}`;
    mailtoLink.target = '_blank';
    mailtoLink.rel = 'noopener noreferrer';
    
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    
    mailtoLink.dispatchEvent(event);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 dark:bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
                >
                  Buyer Information
                </Dialog.Title>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</h3>
                    <p className="mt-1 text-gray-900 dark:text-white">{buyer.full_name || 'Anonymous'}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                    <p className="mt-1 text-gray-900 dark:text-white">{buyer.email}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</h3>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {buyer.location ? (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {buyer.location}
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Not provided</span>
                      )}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</h3>
                    <p className="mt-1 text-gray-900 dark:text-white">{formatDate(buyer.created_at)}</p>
                  </div>

                  {!showMessageBox ? (
                    <button
                      onClick={() => setShowMessageBox(true)}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Send Message
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message here..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleEmailClick}
                          disabled={!message.trim()}
                          className="flex-1 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setShowMessageBox(false);
                          setMessage('');
                        }}
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      onClick={onClose}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 