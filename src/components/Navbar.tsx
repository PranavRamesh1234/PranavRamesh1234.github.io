'use client';

import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Books', href: '/books' },
  { name: 'Sell', href: '/sell' },
  { name: 'Requests', href: '/requests' },
];

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <Disclosure as="nav" className="bg-slate-950/50 backdrop-blur-md shadow-lg sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/" className="text-xl font-bold text-slate-200">
                    BookMart
                  </Link>
                </div>
                <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-slate-300 hover:text-slate-100 transition-colors duration-300"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {user ? (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300">
                        <span className="sr-only">Open user menu</span>
                        {user.avatar_url ? (
                          <Image
                            className="h-8 w-8 rounded-full"
                            src={user.avatar_url}
                            alt={user.full_name}
                            width={32}
                            height={32}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                            {user.full_name.charAt(0) || user.email.charAt(0)}
                          </div>
                        )}
                      </Menu.Button>
                    </div>
                    
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-slate-900/95 backdrop-blur-md py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/profile"
                              className={`${
                                active ? 'bg-slate-800' : ''
                              } block px-4 py-2 text-sm text-slate-200`}
                            >
                              Your Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/books/my-listings"
                              className={`${
                                active ? 'bg-slate-800' : ''
                              } block px-4 py-2 text-sm text-slate-200`}
                            >
                              My Listings
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/my-requests"
                              className={`${
                                active ? 'bg-slate-800' : ''
                              } block px-4 py-2 text-sm text-slate-200`}
                            >
                              My Requests
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => signOut()}
                              className={`${
                                active ? 'bg-slate-800' : ''
                              } block w-full text-left px-4 py-2 text-sm text-slate-200`}
                            >
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="flex space-x-4">
                    <Link
                      href="/auth"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
                    >
                      Sign in
                    </Link>
                  </div>
                )}
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <button className="inline-flex items-center justify-center rounded-md p-2 text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors duration-300">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-2 pl-3 pr-4 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors duration-300"
                >
                  {item.name}
                </Link>
              ))}
            </div>
            {user ? (
              <div className="border-t border-slate-800 pb-3 pt-4">
                <div className="flex items-center px-4">
                  {user.avatar_url ? (
                    <Image
                      className="h-10 w-10 rounded-full"
                      src={user.avatar_url}
                      alt={user.full_name}
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      {user.full_name.charAt(0)}
                    </div>
                  )}
                  <div className="ml-3">
                    <div className="text-base font-medium text-slate-200">
                      {user.full_name}
                    </div>
                    <div className="text-sm font-medium text-slate-400">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors duration-300"
                  >
                    Your Profile
                  </Link>
                  <Link
                    href="/books/my-listings"
                    className="block px-4 py-2 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors duration-300"
                  >
                    My Listings
                  </Link>
                  <Link
                    href="/my-requests"
                    className="block px-4 py-2 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors duration-300"
                  >
                    My Requests
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors duration-300"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-slate-800 pb-3 pt-4">
                <div className="flex items-center px-4">
                  <Link
                    href="/auth"
                    className="block w-full text-center px-4 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-300"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
} 