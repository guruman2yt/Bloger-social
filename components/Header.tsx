'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Flame } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/#blog-section' },
    { name: 'Monetization', path: '/#monetization-section' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgba(99,102,241,0.1)] bg-[rgba(5,3,10,0.7)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/25 transition-transform duration-300 group-hover:scale-105">
            <Flame className="h-5 w-5 text-white animate-pulse" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text text-transparent group-hover:from-white group-hover:to-indigo-300 transition-all duration-300">
            Blogor
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className={`text-sm font-medium transition-colors duration-200 hover:text-indigo-400 ${
                isActive(link.path) ? 'text-indigo-400 font-semibold' : 'text-gray-300'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Spacer for layout structure */}
        <div className="hidden md:block w-1" />

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-900 hover:text-white focus:outline-none"
            aria-controls="mobile-menu"
            aria-expanded={isOpen}
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-[rgba(99,102,241,0.1)] bg-[#05030a]" id="mobile-menu">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`block rounded-lg px-3 py-2 text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-indigo-950/40 text-indigo-400'
                    : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}

          </div>
        </div>
      )}
    </header>
  );
}
