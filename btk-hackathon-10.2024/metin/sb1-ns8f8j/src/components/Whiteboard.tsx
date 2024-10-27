import React from 'react';
import { Pencil, Users, Share2, Layout } from 'lucide-react';

export default function Whiteboard() {
  return (
    <div className="py-24 bg-white" id="whiteboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-24 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Interactive Learning Environment
            </h2>
            <p className="mt-6 text-lg text-gray-500 leading-relaxed">
              Experience seamless collaboration with our advanced digital whiteboard. 
              Share ideas, solve problems together, and learn interactively with 
              real-time feedback from teachers and peers.
            </p>
            
            <div className="mt-12 space-y-6">
              {[
                {
                  icon: Pencil,
                  title: 'Digital Tools',
                  description: 'Advanced drawing tools and mathematical functions',
                },
                {
                  icon: Users,
                  title: 'Real-time Collaboration',
                  description: 'Work together with classmates and teachers instantly',
                },
                {
                  icon: Share2,
                  title: 'Easy Sharing',
                  description: 'Share your work and solutions with one click',
                },
                {
                  icon: Layout,
                  title: 'Multiple Boards',
                  description: 'Organize your work across multiple boards',
                },
              ].map((feature) => (
                <div key={feature.title} className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                      <feature.icon className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                    <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-12 lg:mt-0">
            <div className="relative">
              <img
                className="rounded-2xl shadow-xl ring-1 ring-black ring-opacity-5"
                src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80"
                alt="Interactive whiteboard demonstration"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}