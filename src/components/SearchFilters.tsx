'use client';

import { useState } from 'react';
import { MdLocationCity } from 'react-icons/md';
import LocationDetector from './LocationDetector';
import { categories } from '@/lib/constants';

interface SearchFiltersProps {
  onFilterChange: (filters: any) => void;
  onSortChange: (sort: string) => void;
  initialFilters?: {
    category?: string;
    board?: string;
    classLevel?: string;
    condition?: string;
    priceStatus?: string;
    location?: string | null;
    minPrice?: string;
    maxPrice?: string;
  };
  initialSort?: string;
}

export default function SearchFilters({ 
  onFilterChange, 
  onSortChange,
  initialFilters = {},
  initialSort = 'relevance'
}: SearchFiltersProps) {
  const [filters, setFilters] = useState({
    category: initialFilters.category || '',
    board: initialFilters.board || '',
    classLevel: initialFilters.classLevel || '',
    condition: initialFilters.condition || '',
    priceStatus: initialFilters.priceStatus || '',
    location: initialFilters.location || null,
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleLocationSelect = (location: string, coordinates: { latitude: number; longitude: number }) => {
    handleFilterChange('location', location);
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const key = type === 'min' ? 'minPrice' : 'maxPrice';
    handleFilterChange(key, value);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      category: '',
      board: '',
      classLevel: '',
      condition: '',
      priceStatus: '',
      location: null,
      minPrice: '',
      maxPrice: '',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== null);

    return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-[#00f2ff] hover:text-[#00f2ff]/80"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Location Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Location</label>
          <LocationDetector
            onLocationSelect={handleLocationSelect}
            initialLocation={filters.location || undefined}
            mode="select"
          />
        </div>

        {/* Category Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 bg-[#1E293B] border border-white/20 rounded-md text-white focus:ring-2 focus:ring-[#00f2ff] focus:border-[#00f2ff]"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Board Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Board</label>
          <select
            value={filters.board}
            onChange={(e) => handleFilterChange('board', e.target.value)}
            className="w-full px-3 py-2 bg-[#1E293B] border border-white/20 rounded-md text-white focus:ring-2 focus:ring-[#00f2ff] focus:border-[#00f2ff]"
          >
            <option value="">All Boards</option>
            <option value="CBSE">CBSE</option>
            <option value="ICSE">ICSE</option>
            <option value="State Board">State Board</option>
            <option value="IB">IB</option>
            <option value="IGCSE">IGCSE</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Class Level Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Class Level</label>
          <select
            value={filters.classLevel}
            onChange={(e) => handleFilterChange('classLevel', e.target.value)}
            className="w-full px-3 py-2 bg-[#1E293B] border border-white/20 rounded-md text-white focus:ring-2 focus:ring-[#00f2ff] focus:border-[#00f2ff]"
          >
            <option value="">All Levels</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((level) => (
              <option key={level} value={level.toString()}>
                Class {level}
              </option>
            ))}
          </select>
        </div>

        {/* Condition Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Condition</label>
          <select
            value={filters.condition}
            onChange={(e) => handleFilterChange('condition', e.target.value)}
            className="w-full px-3 py-2 bg-[#1E293B] border border-white/20 rounded-md text-white focus:ring-2 focus:ring-[#00f2ff] focus:border-[#00f2ff]"
          >
            <option value="">All Conditions</option>
            <option value="new">New</option>
            <option value="like-new">Like New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
          </div>

        {/* Price Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Price Range</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="w-full px-3 py-2 bg-[#1E293B] border border-white/20 rounded-md text-white focus:ring-2 focus:ring-[#00f2ff] focus:border-[#00f2ff]"
              />
            </div>
            <div>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => handlePriceChange('max', e.target.value)}
                className="w-full px-3 py-2 bg-[#1E293B] border border-white/20 rounded-md text-white focus:ring-2 focus:ring-[#00f2ff] focus:border-[#00f2ff]"
          />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 