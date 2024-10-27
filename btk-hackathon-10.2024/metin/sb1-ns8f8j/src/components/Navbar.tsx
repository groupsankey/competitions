import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-sm fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">EduPro</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-indigo-600">Features</a>
            <a href="#curriculum" className="text-gray-700 hover:text-indigo-600">Curriculum</a>
            <a href="#whiteboard" className="text-gray-700 hover:text-indigo-600">Whiteboard</a>
            <button 
              onClick={() => navigate('/get-started')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Get Started
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#features" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">Features</a>
            <a href="#curriculum" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">Curriculum</a>
            <a href="#whiteboard" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">Whiteboard</a>
            <button 
              onClick={() => navigate('/get-started')}
              className="w-full text-left px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}