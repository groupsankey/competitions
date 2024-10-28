import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function CallToAction() {
  return (
    <div className="bg-indigo-50">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="relative bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative px-6 py-10 sm:px-10 lg:px-12">
              <div className="max-w-lg mx-auto">
                <h3 className="text-3xl font-bold text-gray-900">
                  Start Your Journey Today
                </h3>
                <p className="mt-4 text-lg text-gray-500">
                  Join thousands of students who are already experiencing 
                  the future of education. Get started with a free trial.
                </p>
                <div className="mt-8 space-y-4">
                  <button className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10">
                    Start Free Trial
                  </button>
                  <button className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 md:py-4 md:text-lg md:px-10">
                    Schedule Demo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                className="absolute inset-0 h-full w-full object-cover"
                src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80"
                alt="Students collaborating"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 to-indigo-900/0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}