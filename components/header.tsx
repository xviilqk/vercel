"use client";
import { useState, useRef, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaChevronDown, 
  FaChevronUp, 
  FaSignOutAlt, 
  FaCalendarAlt,
  FaHeart,
  FaBars, 
  FaTimes,
  FaClock,
} from "react-icons/fa";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  age_group?: string;
  profile_pic?: string;
}

interface Appointment {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  occupation: string;
  age: number;
  gender: string;
  appointment_date: string;
  appointment_time: string;
  pet_id: number | null;
  pet_name?: string;
  status: 'pending' | 'approved' | 'declined';
  admin_note?: string;
  created_at: string;
  updated_at: string;
}

interface HeaderProps {
  loggedInUser: User | null;
  favorites: number[];
  appointments: Appointment[];
  appointmentStatusCount: {
    pending: number;
    approved: number;
    declined: number;
    total: number;
  };
  showAppointmentsModal: boolean;
  setShowAppointmentsModal: (show: boolean) => void;
  handleLogout: () => void;
}

export default function Header({ 
  loggedInUser, 
  favorites, 
  appointments, 
  appointmentStatusCount, 
  showAppointmentsModal, 
  setShowAppointmentsModal, 
  handleLogout,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdoptOpen, setIsAdoptOpen] = useState(false);
  const [isMobileAdoptOpen, setIsMobileAdoptOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <>
      <nav className="fixed w-full top-0 bg-white shadow-md z-50">
        <div className="px-6 flex items-center justify-between h-16">
          <Link href="/" className="ml-6">
            <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-none cursor-pointer">
              <Image 
                src="/images/WhelpsLogo.png"
                alt="WHELPS Logo"
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="block lg:hidden text-myOrage"
          >
            <FaBars className="text-2xl" />
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6">
            <div className="flex items-center space-x-6">
              {/* Adopt Now Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsAdoptOpen(!isAdoptOpen)}
                  className="flex items-center text-myOrage hover:text-blue-600 transition-colors"
                >
                  ADOPT NOW
                  {isAdoptOpen ? (
                    <FaChevronUp className="ml-1" />
                  ) : (
                    <FaChevronDown className="ml-1" />
                  )}
                </button>
                
                {/* Dropdown Menu */}
                {isAdoptOpen && (
                  <div className="absolute left-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link 
                      href="/dogs" 
                      className="block px-4 py-2 text-myOrage hover:bg-gray-100"
                      onClick={() => setIsAdoptOpen(false)}
                    >
                      DOGS
                    </Link>
                    <Link 
                      href="/cats" 
                      className="block px-4 py-2 text-myOrage hover:bg-gray-100"
                      onClick={() => setIsAdoptOpen(false)}
                    >
                      CATS
                    </Link>
                  </div>
                )}
              </div>

              <Link href="/#about" className="text-myOrage hover:text-blue-600 transition-colors">
                ABOUT
              </Link>
              <Link href="/#contacts" className="text-myOrage hover:text-blue-600 transition-colors">
                CONTACTS
              </Link>
              <Link href="/appointments" className="text-myOrage hover:text-blue-600 transition-colors">
                APPOINTMENTS
              </Link>
            </div>
            
            {loggedInUser ? (
              <div className="flex items-center space-x-4">
                {/* Profile Picture with Appointment Status Badge */}
                <div className="relative" ref={profileDropdownRef}>
                  <button 
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="relative flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border-2 border-myOrage cursor-pointer hover:border-blue-600 transition-colors"
                  >
                    <Image 
                      src={loggedInUser.profile_pic || "/images/WhelpsLogo.png"} 
                      alt="Profile" 
                      width={40} 
                      height={40} 
                      className="object-cover"
                    />
                    
                    {/* Appointment Status Badge */}
                    {appointmentStatusCount.total > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                        {appointmentStatusCount.total}
                      </div>
                    )}
                  </button>
                  
                  {/* Profile Dropdown */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
                      <div className="px-4 py-3 border-b">
                        <p className="text-sm font-medium text-gray-900">Hi, {loggedInUser.first_name}</p>
                        <p className="text-xs text-gray-500 truncate">{loggedInUser.email}</p>
                      </div>
                      
                      {/* Appointment Status Button */}
                      <button
                        onClick={() => {
                          setShowAppointmentsModal(true);
                          setIsProfileDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FaCalendarAlt className="mr-3 text-blue-500" />
                        <div>
                          <p className="font-medium">Appointment Status</p>
                          <p className="text-xs text-gray-500">
                            {appointmentStatusCount.total} appointment{appointmentStatusCount.total !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </button>
                      
                      <Link 
                        href="/favorites" 
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <FaHeart className="mr-3 text-red-500" />
                        <div>
                          <p className="font-medium">Favorite Pets</p>
                          <p className="text-xs text-gray-500">
                            {favorites.length} {favorites.length === 1 ? 'pet' : 'pets'} saved
                          </p>
                        </div>
                      </Link>
                      
                      <div className="border-t border-gray-100"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FaSignOutAlt className="mr-3 text-gray-500" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link href="/login">
                <button className="bg-myOrage text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors ml-8">
                  LOGIN
                </button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Appointment Status Modal */}
      {showAppointmentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-myOrage">Appointment Status</h3>
              <button 
                onClick={() => setShowAppointmentsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaCalendarAlt className="mx-auto text-4xl text-gray-300 mb-4" />
                  <p>No appointments scheduled</p>
                  <p className="text-sm mt-2">Schedule your first appointment to see it here!</p>
                </div>
              ) : (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {formatDate(appointment.appointment_date)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <FaClock className="mr-2" />
                      {formatTime(appointment.appointment_time)}
                    </div>
                    {appointment.admin_note && (
                      <div className="text-sm text-gray-600 mt-2">
                        <p className="font-medium">Admin Note:</p>
                        <p>{appointment.admin_note}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAppointmentsModal(false)}
                className="bg-myOrage text-white px-4 py-2 rounded-md hover:bg-orange-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar with Adopt Now dropdown */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${isMenuOpen ? 'block' : 'hidden'}`} onClick={() => setIsMenuOpen(false)}>
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg p-6" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="block lg:hidden text-myOrage mb-6"
          >
            <FaTimes className="text-2xl" />
          </button>
          <div className="flex flex-col space-y-4">
            {/* Mobile Adopt Now Dropdown */}
            <div className="flex flex-col">
              <button 
                onClick={() => setIsMobileAdoptOpen(!isMobileAdoptOpen)}
                className="flex items-center justify-between text-myOrage hover:text-blue-600 transition-colors py-2"
              >
                <span>ADOPT NOW</span>
                {isMobileAdoptOpen ? (
                  <FaChevronUp className="ml-2" />
                ) : (
                  <FaChevronDown className="ml-2" />
                )}
              </button>
              
              {/* Mobile Dropdown Options */}
              {isMobileAdoptOpen && (
                <div className="ml-4 mt-2 space-y-3">
                  <Link 
                    href="/dogs" 
                    className="block text-myOrage hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                    >
                    DOGS
                  </Link>
                  <Link 
                    href="/cats" 
                    className="block text-myOrage hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                    >
                    CATS
                  </Link>
                </div>
              )}
            </div>

            <Link href="/about" className="text-myOrage hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
              ABOUT
            </Link>
            <Link href="/#contacts" className="text-myOrage hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
              CONTACTS
            </Link>
            <Link href="/appointments" className="text-myOrage hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
              APPOINTMENTS
            </Link>
            {loggedInUser ? (
              <>
                <button 
                  onClick={() => {
                    setShowAppointmentsModal(true);
                    setIsMenuOpen(false);
                  }}
                  className="text-myOrage hover:text-blue-600 transition-colors text-left"
                >
                  APPOINTMENT STATUS
                </button>
                <Link href="/favorites" className="text-myOrage hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  FAVORITES
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors text-center"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <button className="bg-myOrage text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors w-full">
                  LOGIN
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}