import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LineChart } from 'lucide-react';

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
          <div className="hidden md:flex md:space-x-8">
            <a href="#features" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">Features</a>
            <a href="#curriculum" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">Curriculum</a>
            <a href="#whiteboard" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">Whiteboard</a>
            <Link to="/graphing" className="flex items-center px-3 py-2 text-gray-700 hover:text-indigo-600">
              <LineChart className="h-5 w-5 mr-1" />
              Graphing
            </Link>
            <button 
              onClick={() => navigate('/get-started')}
              className="w-full text-left px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}