"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaSignOutAlt } from "react-icons/fa";

interface Pet {
  id: number;
  name: string;
  breed: string;
  age: string;
  gender: string;
  size: string;
  color: string;
  healthCondition: string;
  details: string;
  image: string;
  status: "Available" | "In Trial" | "Adopted";
  type: "dog" | "cat";
  story: string;
}

interface ApiPet {
  id: number;
  name: string;
  breed: string;
  age: string;
  gender: string;
  size: string;
  color: string;
  healthCondition: string;
  image?: string;
  status: "Available" | "In Trial" | "Adopted";
  type: "dog" | "cat";
  story: string;
}

const AdminPets = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Pets');
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'dog' | 'cat'>('all');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const petsPerPage = 6;

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pets/`);
        const data = await response.json();
        console.log("API response:", data);
        const mapped: Pet[] = data.map((p: ApiPet) => ({
          id: p.id,
          name: p.name,
          breed: p.breed,
          age: p.age,
          gender: p.gender,
          size: p.size,
          color: p.color,
          healthCondition: p.healthCondition,
          details: `${p.gender} / ${p.age} / ${p.breed}`,
          image: p.image ? new URL(p.image, process.env.NEXT_PUBLIC_API_URL).toString() : '/images/WhelpsLogo.png',
          status: p.status,
          type: p.type,
          story: p.story,
        }));
        setPets(mapped);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pets:', error);
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEditPet = (pet: Pet) => {
    router.push(`/admin/addpet?edit=true&id=${pet.id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user_role');
    localStorage.removeItem('admin_is_staff');
    window.location.href = '/admin/login';
  };

  const filteredPets = pets.filter(pet => {
    const matchesSearch = 
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'dog' && pet.type === 'dog') || 
      (filter === 'cat' && pet.type === 'cat');
    
    return matchesSearch && matchesFilter;
  });

  const indexOfLastPet = currentPage * petsPerPage;
  const indexOfFirstPet = indexOfLastPet - petsPerPage;
  const currentPets = filteredPets.slice(indexOfFirstPet, indexOfLastPet);
  const totalPages = Math.ceil(filteredPets.length / petsPerPage);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="m-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-myOrage"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-myOrage shadow-md">
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
        
        <nav className="p-4">
          <ul>
            {[
              { name: 'Dashboard', path: '/admin/dashboard' },
              { name: 'Pets', path: '/admin/pets' },
              { name: 'Appointments', path: '/admin/appointments' },
              //{ name: 'Pet Matching', path: '/admin/matching' },
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
        <header className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <div className="flex-1"></div>
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full px-4 py-2 border placeholder-myOrage rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
              {/* Profile Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border-2 border-myOrage cursor-pointer hover:border-blue-600 transition-colors"
                >
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <span className="text-sm font-medium text-myOrage">A</span>
                  </div>
                </button>
                
                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">Hi! Admin</p>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FaSignOutAlt className="mr-2 text-gray-500" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4">
              <button 
                onClick={() => setFilter('dog')}
                className={`px-10 py-2 rounded-lg shadow text-xl ${
                  filter === 'dog' ? 'bg-myOrage text-white' : 'bg-myPink text-myOrage'
                }`}
              >
                Dogs
              </button>
              <button 
                onClick={() => setFilter('cat')}
                className={`px-10 py-2 rounded-lg shadow text-xl ${
                  filter === 'cat' ? 'bg-myOrage text-white' : 'bg-myPink text-myOrage'
                }`}
              >
                Cats
              </button>
            </div>
            <Link href="/admin/addpet">
              <button className="bg-myOrage text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                + Add
              </button>
            </Link>
          </div>

          {filteredPets.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {currentPets.map((pet) => (
                  <div key={pet.id} className="bg-white rounded-lg shadow overflow-hidden flex">
                    <div className="w-1/3 flex-shrink-0">
                      <Image
                        src={pet.image}
                        alt={pet.name}
                        width={120}
                        height={120}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="p-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">{pet.name}</h3>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            pet.status === 'Available' ? 'bg-green-100 text-green-800' :
                            pet.status === 'In Trial' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {pet.status}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleEditPet(pet)}
                          className="text-myOrage hover:text-orange-600"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>{pet.breed} • {pet.age}</p>
                        <p>{pet.gender} • {pet.size}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-full ${
                      currentPage === page ? 'bg-myOrage text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No pets found matching your criteria</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPets;