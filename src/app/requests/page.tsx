'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getRequests } from '@/lib/supabase-utils';
import { Request } from '@/types';
import RequestCard from '@/components/RequestCard';
import SearchFilters from '@/components/SearchFilters';
import Pagination from '@/components/Pagination';

const ITEMS_PER_PAGE = 12;

export default function RequestsPage() {
  const searchParams = useSearchParams();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRequests, setTotalRequests] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [selectedPriceStatus, setSelectedPriceStatus] = useState<string | null>(null);
  const [selectedMinPrice, setSelectedMinPrice] = useState<string | null>(null);
  const [selectedMaxPrice, setSelectedMaxPrice] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(searchParams.toString());
        if (searchQuery) params.set('q', searchQuery);
        if (selectedCategory) params.set('category', selectedCategory);
        if (selectedBoard) params.set('board', selectedBoard);
        if (selectedClass) params.set('class', selectedClass);
        if (selectedCity) params.set('city', selectedCity);
        if (selectedCondition) params.set('condition', selectedCondition);
        if (selectedPriceStatus) params.set('priceStatus', selectedPriceStatus);
        if (selectedMinPrice) params.set('minPrice', selectedMinPrice);
        if (selectedMaxPrice) params.set('maxPrice', selectedMaxPrice);
        if (selectedLocation) params.set('location', selectedLocation);
        if (selectedSort) params.set('sort', selectedSort);
        params.set('page', currentPage.toString());
        params.set('limit', ITEMS_PER_PAGE.toString());
        const response = await getRequests(params);
        setRequests(response.data as Request[]);
        setTotalRequests(response.total);
      } catch (err) {
        setError('Failed to fetch requests. Please try again.');
        console.error('Error fetching requests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [
    searchParams,
    searchQuery,
    selectedCategory,
    selectedBoard,
    selectedClass,
    selectedCity,
    selectedCondition,
    selectedPriceStatus,
    selectedMinPrice,
    selectedMaxPrice,
    selectedLocation,
    selectedSort,
    currentPage
  ]);

  const handleFilterChange = (filters: any) => {
    setSelectedCategory(filters.category || null);
    setSelectedBoard(filters.board || null);
    setSelectedClass(filters.classLevel || null);
    setSelectedCity(filters.city || null);
    setSelectedCondition(filters.condition || null);
    setSelectedPriceStatus(filters.priceStatus || null);
    setSelectedMinPrice(filters.minPrice || null);
    setSelectedMaxPrice(filters.maxPrice || null);
    setSelectedLocation(filters.location || null);
    setSelectedSort(filters.sort || 'newest');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalRequests / ITEMS_PER_PAGE);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book Requests</h1>
          <p className="mt-2 text-gray-600">Find books that others are looking for</p>
        </div>
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search requests..."
            className="w-full p-2 border border-gray-300 rounded-md text-black"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-[#1E293B] rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Filters</h2>
              <SearchFilters
                onFilterChange={handleFilterChange}
                initialFilters={{
                  category: selectedCategory || '',
                  board: selectedBoard || '',
                  classLevel: selectedClass || '',
                  condition: selectedCondition || '',
                  priceStatus: selectedPriceStatus || '',
                  location: selectedLocation || '',
                  minPrice: selectedMinPrice || '',
                  maxPrice: selectedMaxPrice || '',
                }}
              />
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Sort By</label>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="newest">Newest</option>
                <option value="relevance">Relevance</option>
                <option value="distance">Distance</option>
              </select>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No requests found matching your criteria.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {requests.map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </div>
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page: number) => setCurrentPage(page)}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 