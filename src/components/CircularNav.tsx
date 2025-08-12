
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, LogOut, Home, Info, BookOpen, Image, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

import { TubelightNavBar } from '@/components/ui/tubelight-navbar';

const CircularNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'About', url: '/about', icon: Info },
    { name: 'Batches', url: '/batches', icon: BookOpen },
    { name: 'Gallery', url: '/gallery', icon: Image },
    { name: 'Contact', url: '/contact', icon: MessageCircle },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden lg:block">
        <div className="fixed top-0 left-0 right-0 z-40 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0 w-48">
              <Link to="/" className="flex items-center">
                <img 
                  src="/lovable-uploads/1588d38a-7e4d-4f9f-a394-e79adb26ec99.png" 
                  alt="Be In Shape Logo" 
                  className="h-12 w-auto hover:scale-105 transition-transform duration-300"
                />
              </Link>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 flex justify-center">
              <div className="flex items-center bg-white/95 dark:bg-gray-900/95 border border-gray-200/30 dark:border-gray-700/30 backdrop-blur-xl py-2 px-4 rounded-full shadow-lg">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.url}
                      className="relative cursor-pointer text-sm font-semibold px-4 py-2 rounded-full transition-all duration-300 font-dejanire flex items-center gap-2 whitespace-nowrap text-gray-700 dark:text-gray-300 hover:text-[#e3bd30] hover:bg-[#e3bd30]/5"
                    >
                      <span className="relative z-10">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Side Controls */}
            <div className="flex-shrink-0 w-48 flex justify-end">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link to="/dashboard" className="flex-shrink-0">
                    <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] text-black rounded-full hover:from-[#d4a82a] hover:to-[#e6c235] transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-dejanire whitespace-nowrap min-w-[120px] justify-center">
                      <User className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">Dashboard</span>
                    </div>
                  </Link>
                  <button
                    onClick={signOut}
                    className="p-3 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full flex-shrink-0"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="flex-shrink-0">
                  <div className="px-8 py-3 bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] text-black rounded-full hover:from-[#d4a82a] hover:to-[#e6c235] transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 font-dejanire whitespace-nowrap min-w-[80px] text-center">
                    Login
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Navigation */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-700/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/1588d38a-7e4d-4f9f-a394-e79adb26ec99.png" 
                alt="Be In Shape Logo" 
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] text-black rounded-full hover:from-[#d4a82a] hover:to-[#e6c235] transition-all shadow-lg font-dejanire text-sm whitespace-nowrap">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium hidden sm:inline">Dashboard</span>
                </Link>
                <button
                  onClick={signOut}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors hover:bg-white/10 rounded-lg flex-shrink-0"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/auth" className="flex-shrink-0">
                <div className="px-4 py-2 bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] text-black rounded-full hover:from-[#d4a82a] hover:to-[#e6c235] transition-all font-semibold shadow-lg font-dejanire text-sm whitespace-nowrap">
                  Login
                </div>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="mt-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-2xl">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.url}
                  onClick={() => setIsOpen(false)}
                  className="text-gray-700 dark:text-gray-300 hover:text-[#e3bd30] transition-colors font-medium py-3 px-4 rounded-lg hover:bg-[#e3bd30]/5 flex items-center space-x-3 font-dejanire"
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default CircularNav;
