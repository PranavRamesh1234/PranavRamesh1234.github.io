import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';

interface SellerInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  seller: {
    id: string;
    full_name: string;
    email: string;
    phone_number: string | null;
    avatar_url: string | null;
    location: string | null;
    created_at: string;
    updated_at: string;
  };
}

export default function SellerInfoDialog({ isOpen, onClose, seller }: SellerInfoDialogProps) {
  const [message, setMessage] = useState('');
  const [showMessageBox, setShowMessageBox] = useState(false);

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) {
      return 'N/A';
    }
    
    try {
      // Parse the ISO string and format it
      const date = parseISO(dateString);
      return format(date, 'd MMMM yyyy');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const handleWhatsAppClick = () => {
    if (!seller.phone_number) return;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${seller.phone_number}?text=${encodedMessage}`, '_blank');
  };

  const handleEmailClick = () => {
    // Format the message with proper line breaks
    const formattedMessage = message.replace(/\n/g, '%0A');
    
    // Create the mailto link with all parameters
    const mailtoLink = document.createElement('a');
    mailtoLink.href = `mailto:${seller.email}?subject=${encodeURIComponent('Regarding your book listing')}&body=${encodeURIComponent(formattedMessage)}`;
    mailtoLink.target = '_blank';
    mailtoLink.rel = 'noopener noreferrer';
    
    // Prevent any default behavior
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    
    // Dispatch the event
    mailtoLink.dispatchEvent(event);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/30 dark:bg-black/50 z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {seller.avatar_url ? (
                  <img
                    src={seller.avatar_url}
                    alt={seller.full_name || 'Seller'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-gray-500 dark:text-gray-400">
                    {(seller.full_name || seller.email || '?')[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {seller.full_name || 'Anonymous Seller'}
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                <p className="mt-1 text-gray-900 dark:text-white">{seller.email}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</h3>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {seller.phone_number ? (
                    <a href={`tel:${seller.phone_number}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                      {seller.phone_number}
                    </a>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">Not provided</span>
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</h3>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {seller.location ? (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {seller.location}
                    </span>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">Not provided</span>
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</h3>
                <p className="mt-1 text-gray-900 dark:text-white">{formatDate(seller.created_at)}</p>
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
                  <div className="flex space-x-2">
                    {seller.phone_number && (
                      <button
                        onClick={handleWhatsAppClick}
                        disabled={!message.trim()}
                        className="flex-1 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp
                      </button>
                    )}
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 