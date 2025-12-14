"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const PetMatchingPage = () => {
  const [activeTab, setActiveTab] = useState('Pet Matching');

  // Data for charts
  const petPreferenceData = [
    { name: 'Dogs', value: 77 },
    { name: 'Cats', value: 23 },
  ];

  const personalityData = [
    { name: 'Friendly & Social', value: 45 },
    { name: 'Playful & Energetic', value: 30 },
    { name: 'Calm & Low Maintenance', value: 25 },
  ];

  const topCatMatches = [
    { name: 'Nala', value: 47 },
    { name: 'Cleo', value: 23 },
    { name: 'Theo', value: 19 },
  ];

  const topDogMatches = [
    { name: 'Haru', value: 47 },
    { name: 'Milo', value: 34 },
    { name: 'Molly', value: 19 },
  ];

  const COLORS = ['#FF6B6B', '#4ECDC4'];
  const MATCH_COLORS = ['#DC700B'];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - unchanged */}
      <div className="w-64 bg-myOrage shadow-md">
        {/* Logo - Centered */}
        <div className="flex justify-center p-4">
          <Link href="/admin/dashboard" className="flex justify-center">
            <div className="h-30 w-30 rounded-full overflow-hidden border-none cursor-pointer">
              <Image 
                src="/images/Whelpswhite.png"
                alt="WHELPS Logo"
                width={180}
                height={180}
                className="object-cover"
              />
            </div>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="p-4">
          <ul>
            {[
              { name: 'Dashboard', path: '/admin/dashboard' },
              { name: 'Pets', path: '/admin/pets' },
              { name: 'Appointments', path: '/admin/appointments' },
              { name: 'Pet Matching', path: '/admin/matching' },
              //{ name: 'Questionnaire', path: '/admin/questionnaire' },
              //{ name: 'Settings', path: '/admin/settings' }
            ].map((item) => (
              <li key={item.name} className="mb-2">
                <Link
                  href={item.path}
                  className={`flex items-center w-full text-left text-2xl px-4 py-2 rounded-lg transition-colors ${
                    activeTab === item.name 
                      ? 'bg-myPink text-myOrage font-semibold' 
                      : 'text-white hover:bg-myPink hover:bg-opacity-50'
                  }`}
                  onClick={() => setActiveTab(item.name)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header - unchanged */}
        <header className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <div className="flex-1"></div>
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full px-4 py-2 border placeholder-myOrage rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                />
                <svg
                  className="absolute right-3 top-2.5 h-5 w-5 text-myOrage"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1 flex justify-end items-center">
              <span className="mr-2 text-gray-700">Admin 1</span>
              <button
                onClick={() => {
                  localStorage.removeItem('admin_token');
                  localStorage.removeItem('admin_user_role');
                  localStorage.removeItem('admin_is_staff');
                  window.location.href = '/admin/login';
                }}
                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors mr-2"
              >
                Logout
              </button>
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium"></span>
              </div>
            </div>
          </div>
        </header>

        {/* Pet Matching Content */}
        <main className="p-6">
          {/* Top Row - Horizontal Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Most Preferred Pet Personalities */}
            <div className="bg-myPink p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-myOrage mb-4">Most Preferred Pet Personalities</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={personalityData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    <Bar dataKey="value" fill="#DC700B" name="Percentage" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top 3 Cat Matches */}
            <div className="bg-myPink p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-myOrage mb-4">Top 3 Cat Matches</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topCatMatches}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip formatter={(value) => [`${value}%`, 'Match Percentage']} />
                    <Bar dataKey="value" fill="#8884d8" name="Match Percentage">
                      {topCatMatches.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={MATCH_COLORS[index % MATCH_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top 3 Dog Matches */}
            <div className="bg-myPink p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-myOrage mb-4">Top 3 Dog Matches</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topDogMatches}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip formatter={(value) => [`${value}%`, 'Match Percentage']} />
                    <Bar dataKey="value" fill="#82ca9d" name="Match Percentage">
                      {topDogMatches.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={MATCH_COLORS[index % MATCH_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Row - Original Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Setup Section */}
            <div className="bg-myPink p-6 rounded-lg shadow">
              <h2 className="text-2xl font-medium text-myOrage mb-2">Pet Preferred</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={petPreferenceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {petPreferenceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Test Section */}
            <div className="bg-myPink p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold text-myOrage mb-4">Fastest Matches & Scheduling</h2>
              <div className="space-y-4">
                <div className="bg-none p-2 rounded-lg">
                  <p className="font-semibold text-myOrage text-xl">Haru (Dog)</p>
                  <p className="text-myOrage">Matched and scheduled within 24 hours</p>
                </div>
                <div className="bg-none p-2 rounded-lg">
                  <p className="font-semibold text-myOrage text-xl">Nala (Cat)</p>
                  <p className="text-myOrage">Matched and scheduled within 48 hours</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PetMatchingPage;