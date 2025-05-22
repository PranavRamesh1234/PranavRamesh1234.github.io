'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import AuthDialog from './AuthDialog';
import { getCurrentLocation as getLocation } from '@/utils/location';
import { categories } from '@/lib/constants';
import MapDialog from './MapDialog';
import { toast } from 'react-hot-toast';

const conditions = [
  { id: 'new', name: 'New' },
  { id: 'like-new', name: 'Like New' },
  { id: 'good', name: 'Good' },
  { id: 'fair', name: 'Fair' },
  { id: 'poor', name: 'Poor' },
];

const boards = [
  { value: 'CBSE', label: 'CBSE' },
  { value: 'ICSE', label: 'ICSE' },
  { value: 'State Board', label: 'State Board' },
  { value: 'IB', label: 'IB' },
  { value: 'IGCSE', label: 'IGCSE' },
  { value: 'Other', label: 'Other' },
];

const classLevels = [
  { value: '1', label: 'Class 1' },
  { value: '2', label: 'Class 2' },
  { value: '3', label: 'Class 3' },
  { value: '4', label: 'Class 4' },
  { value: '5', label: 'Class 5' },
  { value: '6', label: 'Class 6' },
  { value: '7', label: 'Class 7' },
  { value: '8', label: 'Class 8' },
  { value: '9', label: 'Class 9' },
  { value: '10', label: 'Class 10' },
  { value: '11', label: 'Class 11' },
  { value: '12', label: 'Class 12' },
];

const subjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
  'Economics',
  'Computer Science',
  'Other'
];

interface BookFormData {
  title: string;
  author: string;
  price: string;
  price_type: string;
  condition: string;
  description: string;
  category: string;
  location: string;
  year_of_publication: string;
  images: File[];
  tags: string[];
  board: string;
  class_level: string;
  subject: string;
  coordinates: { latitude: number; longitude: number };
}

const isAcademicBook = (category: string) => {
  return ['school-textbooks', 'competitive-exams', 'engineering-medical', 'college-textbooks'].includes(category);
};

const needsBoardAndClass = (category: string) => {
  return ['school-textbooks', 'competitive-exams', 'engineering-medical'].includes(category);
};

export default function BookUploadForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [locationInput, setLocationInput] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  // Show auth dialog immediately if user is not authenticated
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        setShowAuthDialog(true);
      }, 1000); // Show after 1 second
      return () => clearTimeout(timer);
    }
  }, [user]);

  const [formData, setFormData] = useState<BookFormData>(() => {
    // Only access localStorage in browser environment
    if (typeof window !== 'undefined') {
      const cachedData = localStorage.getItem('bookFormData');
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          // Set location input if it exists
          if (parsedData.location) {
            setLocationInput(parsedData.location);
          }
          // Reset images array as we can't restore File objects
          parsedData.images = [];
          return parsedData;
        } catch (error) {
          console.error('Error parsing cached form data:', error);
        }
      }
    }
    // Return default values if no cached data or in server environment
    return {
      title: '',
      author: '',
      price: '',
      price_type: 'fixed',
      condition: 'new',
      description: '',
      category: 'school-textbooks',
      location: '',
      year_of_publication: '',
      images: [],
      tags: [],
      board: 'CBSE',
      class_level: '',
      subject: '',
      coordinates: { latitude: 0, longitude: 0 },
    };
  });

  // Save form data to cache whenever it changes, but exclude File objects
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dataToCache = {
        ...formData,
        images: [] // Don't cache images as they can't be serialized
      };
      localStorage.setItem('bookFormData', JSON.stringify(dataToCache));
    }
  }, [formData]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        formData.images.forEach(img => {
          if (img instanceof File) {
            URL.revokeObjectURL(URL.createObjectURL(img));
          }
        });
      }
    };
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageFiles]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Store form data in localStorage before any checks
    if (typeof window !== 'undefined') {
      const dataToCache = {
        ...formData,
        images: [] // Don't cache images as they can't be serialized
      };
      localStorage.setItem('bookFormData', JSON.stringify(dataToCache));
    }

    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    // Validate form data
    const trimmedTitle = formData.title.trim();
    const trimmedAuthor = formData.author.trim();
    const trimmedDescription = formData.description.trim();
    const trimmedLocation = formData.location.trim();

    if (!trimmedTitle) {
      setError('Title cannot be empty');
      return;
    }
    if (!trimmedAuthor) {
      setError('Author cannot be empty');
      return;
    }
    if (/^\d+$/.test(trimmedAuthor)) {
      setError('Author name cannot contain only numbers');
      return;
    }
    if (!trimmedDescription) {
      setError('Description cannot be empty');
      return;
    }
    if (!trimmedLocation) {
      setError('Location cannot be empty');
      return;
    }
    if (formData.price_type !== 'price-on-call' && (!formData.price || parseFloat(formData.price) <= 0)) {
      setError('Please enter a valid price');
      return;
    }
    if (!formData.year_of_publication || parseInt(formData.year_of_publication) < 1900 || parseInt(formData.year_of_publication) > new Date().getFullYear()) {
      setError('Please enter a valid year of publication');
      return;
    }
    if (formData.images.length === 0) {
      setError('Please upload at least one image');
      return;
    }
    if (formData.images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, upload images to storage
      const imageUrls: string[] = [];
      for (const image of formData.images) {
        try {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('book-images')
          .upload(filePath, image);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
            throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('book-images')
          .getPublicUrl(filePath);

        imageUrls.push(publicUrl);
        } catch (imageError) {
          console.error('Error processing image:', imageError);
          throw new Error(`Failed to process image: ${imageError instanceof Error ? imageError.message : 'Unknown error'}`);
        }
      }

      // Then, insert the book data with trimmed values
      const bookData = {
        title: trimmedTitle,
        author: trimmedAuthor,
        description: trimmedDescription,
        location: trimmedLocation,
        coordinates: formData.coordinates,
        price: formData.price_type === 'price-on-call' ? null : parseFloat(formData.price),
        year_of_publication: parseInt(formData.year_of_publication),
        seller_id: user.id,
        status: 'available',
        images: imageUrls,
        category: formData.category,
        condition: formData.condition,
        board: formData.board,
        class_level: formData.class_level,
        subject: formData.subject,
        tags: formData.tags,
        price_type: formData.price_type
      };

      console.log('Inserting book data:', bookData);

      const { data, error } = await supabase.from('books').insert([bookData]).select().single();

      if (error) {
        console.error('Error inserting book:', error);
        throw new Error(`Failed to create book: ${error.message}`);
      }

      // Clear the cached form data after successful submission
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bookFormData');
      }
      
      router.push('/books/' + data.id);
    } catch (err) {
      console.error('Error uploading book:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newFiles],
      }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      board: e.target.value,
    }));
  };

  const getCurrentLocation = async () => {
    try {
      const { locationString, coordinates } = await getLocation();
      setLocationInput(locationString);
      setSelectedCoordinates(coordinates);
      setFormData(prev => ({
        ...prev,
        location: locationString,
        coordinates
      }));
        } catch (error) {
      console.error('Error getting location:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to get location');
    }
  };

  const handleLocationSelect = (location: { latitude: number; longitude: number; address: string }) => {
    setSelectedCoordinates(location);
    setLocationInput(location.address);
    setFormData(prev => ({ 
      ...prev, 
      location: location.address,
      coordinates: {
        latitude: location.latitude,
        longitude: location.longitude
      }
    }));
  };

  const renderPriceSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          *Price Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'fixed', label: 'Fixed Price' },
            { id: 'negotiable', label: 'Negotiable' },
            { id: 'price-on-call', label: 'Price on Call' },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, price_type: type.id }))}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                formData.price_type === type.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {formData.price_type !== 'price-on-call' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            *Price
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required={formData.price_type !== 'price-on-call'}
            min="0"
            step="0.01"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            List Your Book
          </h1>

          <div className="w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="relative">
                  <label className="block text-sm font-medium text-white/70 mb-2">Title</label>
                <input
                  type="text"
                    id="title"
                  value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full h-12 bg-transparent border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="Enter book title"
                  required
                />
              </div>

                {/* Author */}
                <div className="relative">
                  <label className="block text-sm font-medium text-white/70 mb-2">Author</label>
                <input
                  type="text"
                    id="author"
                  value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full h-12 bg-transparent border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="Enter author name"
                    required
                  />
                </div>

                {/* Price Type - Full Width */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white/70 mb-2">Price Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'fixed', name: 'Fixed Price' },
                      { id: 'negotiable', name: 'Negotiable' },
                      { id: 'price-on-call', name: 'Price on Call' }
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, price_type: type.id })}
                        className={`h-12 px-4 rounded-xl transition-all ${
                          formData.price_type === type.id
                            ? 'bg-gradient-to-r from-[#d44d4d] to-[#d47d5d] text-white border border-[#d44d4d]/40 shadow-lg scale-105'
                            : 'bg-white/5 text-white/70 border border-white/20 hover:bg-white/10'
                        }`}
                        aria-pressed={formData.price_type === type.id}
                      >
                        {type.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price - Only show if not price-on-call */}
                {formData.price_type !== 'price-on-call' && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-white/70 mb-2">Price</label>
                    <input
                      type="number"
                      id="price"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full h-12 bg-transparent border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      placeholder="Enter price"
                      required={formData.price_type !== 'price-on-call'}
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}

                {/* Condition - Full Width */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white/70 mb-2">Condition</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {conditions.map((condition) => (
                      <button
                        key={condition.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, condition: condition.id })}
                        className={`h-12 px-4 rounded-xl transition-all ${
                          formData.condition === condition.id
                            ? 'bg-gradient-to-r from-[#d44d4d] to-[#d47d5d] text-white border border-[#d44d4d]/40 shadow-lg scale-105'
                            : 'bg-white/5 text-white/70 border border-white/20 hover:bg-white/10'
                        }`}
                        aria-pressed={formData.condition === condition.id}
                      >
                        {condition.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="relative md:col-span-2">
                  <label className="block text-sm font-medium text-white/70 mb-2">Description</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full h-32 bg-transparent border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter book description"
                  required
                />
              </div>

                {/* Category */}
                <div className="relative">
                  <label className="block text-sm font-medium text-white/70 mb-2">Category</label>
                <select
                    id="category"
                  value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-12 bg-transparent border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all appearance-none"
                  required
                >
                    <option value="" disabled>Select Category</option>
                  {categories.map((category) => (
                      <option key={category.value} value={category.value} className="bg-[#1E293B]">
                      {category.label}
                    </option>
                  ))}
                </select>
                  <div className="absolute right-4 top-[38px] pointer-events-none">
                    <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
              </div>

                {/* Academic-specific fields */}
                {isAcademicBook(formData.category) && (
                  <>
                    {/* Subject - For all academic books */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-white/70 mb-2">Subject</label>
                      {formData.category === 'college-textbooks' ? (
                        <input
                          type="text"
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full h-12 bg-transparent border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                          placeholder="e.g., Computer Science, Mechanical Engineering, etc."
                          required={isAcademicBook(formData.category)}
                        />
                      ) : (
                        <select
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full h-12 bg-transparent border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all appearance-none"
                          required={isAcademicBook(formData.category)}
                        >
                          <option value="" disabled>Select Subject</option>
                          {subjects.map((subject) => (
                            <option key={subject} value={subject} className="bg-[#1E293B]">
                              {subject}
                            </option>
                          ))}
                        </select>
                      )}
                      <div className="absolute right-4 top-[38px] pointer-events-none">
                        <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Board and Class Level - Only for school books and competitive exams */}
                    {needsBoardAndClass(formData.category) && (
                      <>
                        {/* Board */}
                        <div className="relative">
                          <label className="block text-sm font-medium text-white/70 mb-2">Board</label>
                <select
                            id="board"
                  value={formData.board}
                            onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                            className="w-full h-12 bg-transparent border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all appearance-none"
                            required={needsBoardAndClass(formData.category)}
                          >
                            <option value="" disabled>Select Board</option>
                  {boards.map((board) => (
                              <option key={board.value} value={board.value} className="bg-[#1E293B]">
                      {board.label}
                    </option>
                  ))}
                </select>
                          <div className="absolute right-4 top-[38px] pointer-events-none">
                            <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
              </div>

                        {/* Class Level */}
                        <div className="relative">
                          <label className="block text-sm font-medium text-white/70 mb-2">Class Level</label>
                <select
                            id="class_level"
                  value={formData.class_level}
                            onChange={(e) => setFormData({ ...formData, class_level: e.target.value })}
                            className="w-full h-12 bg-transparent border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all appearance-none"
                            required={needsBoardAndClass(formData.category)}
                          >
                            <option value="" disabled>Select Class Level</option>
                  {classLevels.map((level) => (
                              <option key={level.value} value={level.value} className="bg-[#1E293B]">
                      {level.label}
                    </option>
                  ))}
                </select>
                          <div className="absolute right-4 top-[38px] pointer-events-none">
                            <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
              </div>
            </div>
                      </>
                    )}
                  </>
                )}

                {/* Location */}
                <div className="relative">
                  <label className="block text-sm font-medium text-white/70 mb-2">Location</label>
                  <div className="flex">
                    <div className="flex-1 h-12 bg-transparent border border-white/20 rounded-lg px-4 py-2 text-white flex items-center overflow-hidden">
                      <span className="truncate">
                        {locationInput || 'Select a location on the map'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMapOpen(true)}
                      className="h-12 w-12 bg-gradient-to-r from-[#d44d4d] to-[#d47d5d] rounded-r-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ml-2"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Year of Publication */}
                <div className="relative">
                  <label className="block text-sm font-medium text-white/70 mb-2">Year of Publication</label>
                  <input
                    type="number"
                    id="year_of_publication"
                    value={formData.year_of_publication}
                    onChange={(e) => setFormData({ ...formData, year_of_publication: e.target.value })}
                    className="w-full h-12 bg-transparent border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="Enter year"
                required
                    min="1900"
                    max={new Date().getFullYear()}
              />
            </div>

                {/* Images */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white/70 mb-2">Images</label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label 
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                          isDragging 
                            ? 'border-[#d44d4d] bg-[#d44d4d]/10' 
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <p className="mb-2 text-sm text-white/50">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-white/50">PNG, JPG or JPEG (max. 5 images)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          ref={fileInputRef}
                        />
              </label>
                    </div>

                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {formData.images.map((image, index) => (
                          <div key={index} className="relative group">
                    <img
                              src={URL.createObjectURL(image)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                              className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
                    )}
                  </div>
            </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#d44d4d] to-[#d47d5d] hover:scale-105 transition-all px-6 py-3 rounded-xl text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Uploading...' : 'List Book'}
              </button>
            </div>
          </form>
        </div>
        </motion.div>
      </div>

    {showAuthDialog && (
      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
      />
    )}

    <MapDialog
      isOpen={isMapOpen}
      onClose={() => setIsMapOpen(false)}
      onLocationSelect={handleLocationSelect}
      initialLocation={selectedCoordinates || undefined}
      />
    </div>
  );
} 