"use client";
import { useState, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaSignOutAlt } from "react-icons/fa";
import "@/styles/appointments-calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

type PetStats = {
  dogs: number;
  cats: number;
  petsAvailable: number;
  inTrial: number;
};

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

type ApiAppointment = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  occupation: string;
  age: number;
  gender: string;
  appointment_date: string;
  appointment_time: string;
  agreement_accepted: boolean;
  pet_id: number | null;
  status: 'pending' | 'approved' | 'declined';
  admin_note?: string;
  created_at?: string;
  updated_at?: string;
};

type UiAppointment = {
  id: number;
  name: string;
  email: string;
  phone: string;
  occupation: string;
  age: number;
  gender: string;
  petBooked: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'declined';
  admin_note?: string;
  created_at?: string;
  updated_at?: string;
};

const AdminDashboard = () => {
  const [date, setDate] = useState<Value>(new Date());
  const [petStats, setPetStats] = useState<PetStats>({
    dogs: 0,
    cats: 0,
    petsAvailable: 0,
    inTrial: 0,
  });
  const [appointments, setAppointments] = useState<UiAppointment[]>([]);
  const [todayAppointment, setTodayAppointment] = useState<UiAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<UiAppointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    const adminRole = localStorage.getItem('admin_user_role');
    const adminIsStaff = localStorage.getItem('admin_is_staff') === 'true';
    if (!adminToken || !(adminRole === 'admin' || adminIsStaff)) {
      router.replace('/admin/login');
      return;
    }
  }, [router]);

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

  const formatDateForUi = (isoDate: string) => {
    const d = new Date(isoDate + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
  };

  const formatTimeForUi = (hhmmss: string) => {
    const [hStr, mStr] = hhmmss.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const period = h < 12 ? 'AM' : 'PM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const fetchAppointmentDetails = async (id: number) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/appointments/${id}/`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Token ${token}` } : {}),
        },
      });
      
      if (response.ok) {
        const appointmentData = await response.json();
        return appointmentData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      return null;
    }
  };

  const handleViewDetails = async (appointment: UiAppointment) => {
    if (appointment.email && appointment.phone) {
      setSelectedAppointment(appointment);
      setShowModal(true);
      return;
    }
    
    try {
      const details = await fetchAppointmentDetails(appointment.id);
      if (details) {
        const fullAppointment: UiAppointment = {
          ...appointment,
          email: details.email,
          phone: details.phone,
          occupation: details.occupation,
          age: details.age,
          gender: details.gender,
          admin_note: details.admin_note,
          created_at: details.created_at,
          updated_at: details.updated_at,
        };
        setSelectedAppointment(fullAppointment);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user_role');
    localStorage.removeItem('admin_is_staff');
    router.push('/admin/login');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        
        // Fetch pets
        const petsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pets/`);
        const petsData = await petsResponse.json();
        
        const mappedPets: Pet[] = petsData.map((p: ApiPet) => ({
          id: p.id,
          name: p.name,
          breed: p.breed,
          age: p.age,
          gender: p.gender,
          size: p.size,
          color: p.color,
          healthCondition: p.healthCondition,
          details: `${p.gender} / ${p.age} / ${p.breed}`,
          image: p.image || '/images/WhelpsLogo.png',
          status: p.status,
          type: p.type,
          story: p.story,
        }));
        
        setPetStats({
          dogs: mappedPets.filter(pet => pet.type === 'dog').length,
          cats: mappedPets.filter(pet => pet.type === 'cat').length,
          petsAvailable: mappedPets.filter(pet => pet.status === 'Available').length,
          inTrial: mappedPets.filter(pet => pet.status === 'In Trial').length,
        });

        // Fetch appointments
        const appointmentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/appointments/`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Token ${token}` } : {}),
          },
        });
        
        if (appointmentsResponse.ok) {
          const appointmentsData = await appointmentsResponse.json();
          
          const validatedData = appointmentsData.filter((item: ApiAppointment) => (
            typeof item === 'object' && 
            item !== null &&
            typeof item.id === 'number' &&
            typeof item.full_name === 'string' &&
            typeof item.appointment_date === 'string' &&
            typeof item.appointment_time === 'string' &&
            typeof item.status === 'string' &&
            ['pending', 'approved', 'declined'].includes(item.status)
          ));

          // Move getPetNameById inside the useEffect to avoid dependency issues
          const getPetNameById = (petId: number | null): string => {
            if (!petId) return '-';
            const pet = mappedPets.find(p => p.id === petId);
            return pet ? pet.name : `Pet #${petId}`;
          };
          
          const uiAppointments: UiAppointment[] = validatedData.map((a: ApiAppointment) => ({
            id: a.id,
            name: a.full_name,
            email: a.email,
            phone: a.phone,
            occupation: a.occupation,
            age: a.age,
            gender: a.gender,
            petBooked: getPetNameById(a.pet_id),
            date: formatDateForUi(a.appointment_date),
            time: formatTimeForUi(a.appointment_time),
            status: a.status,
          }));
          
          setAppointments(uiAppointments);
          
          // Find today's appointment - RELIABLE DATE COMPARISON
          const today = new Date();
          
          const todayAppt = validatedData.find((a: ApiAppointment) => {
            // Convert both dates to Date objects and compare year, month, day
            const appointmentDate = new Date(a.appointment_date);
            
            return appointmentDate.getFullYear() === today.getFullYear() &&
                   appointmentDate.getMonth() === today.getMonth() &&
                   appointmentDate.getDate() === today.getDate() &&
                   a.status === 'approved';
          });
          
          if (todayAppt) {
            setTodayAppointment({
              id: todayAppt.id,
              name: todayAppt.full_name,
              email: todayAppt.email,
              phone: todayAppt.phone,
              occupation: todayAppt.occupation,
              age: todayAppt.age,
              gender: todayAppt.gender,
              petBooked: getPetNameById(todayAppt.pet_id),
              date: formatDateForUi(todayAppt.appointment_date),
              time: formatTimeForUi(todayAppt.appointment_time),
              status: todayAppt.status,
            });
          } else {
            setTodayAppointment(null); // Clear any previous today appointment
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array - runs only once

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setDate(value);
    } else if (Array.isArray(value)) {
      setDate(value[0]);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="m-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-myOrage"></div>
          <p className="mt-4 text-myOrage">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Appointment Details Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-myOrage">Appointment Details</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-lg text-myOrage">{selectedAppointment.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Pet Booked</p>
                <p className="text-lg text-myOrage">{selectedAppointment.petBooked}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="text-lg text-myOrage">{selectedAppointment.date} at {selectedAppointment.time}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Contact Information</p>
                <p className="text-myOrage">Email: {selectedAppointment.email}</p>
                <p className="text-myOrage">Phone: {selectedAppointment.phone}</p>
              </div>
              
              {selectedAppointment.occupation && (
                <div>
                  <p className="text-sm text-gray-500">Occupation</p>
                  <p className="text-myOrage">{selectedAppointment.occupation}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-500">Age & Gender</p>
                <p className="text-myOrage">{selectedAppointment.age} years old, {selectedAppointment.gender}</p>
              </div>
              
              {selectedAppointment.admin_note && (
                <div>
                  <p className="text-sm text-gray-500">Admin Note</p>
                  <p className="text-myOrage">{selectedAppointment.admin_note}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-myOrage text-white px-4 py-2 rounded-md hover:bg-orange-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
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
              //{ name: 'Pet Matching', path: '/admin/matching' },
              //{ name: 'Questionnaire', path: '/admin/questionnaire' },
              //{ name: 'Settings', path: '/admin/settings' }
            ].map((item) => (
              <li key={item.name} className="mb-2">
                <Link
                  href={item.path}
                  className="flex items-center w-full text-left text-2xl px-4 py-2 rounded-lg transition-colors text-white hover:bg-myPink hover:bg-opacity-50"
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
        {/* Header */}
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

        {/* Dashboard Content */}
        <main className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column - Pet Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Top Row - Dogs and Cats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                <div className="bg-myPink p-2 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-myOrage">Dogs</h3>
                  <p className="text-5xl font-bold text-myOrage">{petStats.dogs}</p>
                </div>
                <div className="bg-myPink p-2 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-myOrage">Cats</h3>
                  <p className="text-5xl font-bold text-myOrage">{petStats.cats}</p>
                </div>
              </div>

              {/* Bottom Row - Pets Available and In-trial */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                <div className="bg-myPink p-2 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-myOrage">Pets Available</h3>
                  <p className="text-5xl font-bold text-myOrage">{petStats.petsAvailable}</p>
                </div>
                <div className="bg-myPink p-2 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-myOrage">In-trial</h3>
                  <p className="text-5xl font-bold text-myOrage">{petStats.inTrial}</p>
                </div>
              </div>

              {/* Appointment History */}
              <h3 className="text-3xl font-semibold text-myOrage mb-4">Appointment History</h3>
              <div className={`overflow-x-auto rounded-lg ${appointments.length > 3 ? 'max-h-60 overflow-y-auto' : ''}`}>
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b bg-myOrage">
                      <th className="text-left py-2 px-4 text-white font-medium">Name</th>
                      <th className="text-left py-2 px-4 text-white font-medium">Pet Booked</th>
                      <th className="text-left py-2 px-4 text-white font-medium">Date</th>
                      <th className="text-left py-2 px-4 text-white font-medium">Time</th>
                      <th className="text-left py-2 px-4 text-white font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.slice(0, appointments.length > 3 ? appointments.length : 3).map((appointment) => (
                      <tr key={appointment.id} className="border-b bg-myPink">
                        <td className="py-3 px-4 text-myOrage">{appointment.name}</td>
                        <td className="py-3 px-4 text-myOrage">{appointment.petBooked}</td>
                        <td className="py-3 px-4 text-myOrage">{appointment.date}</td>
                        <td className="py-3 px-4 text-myOrage">{appointment.time}</td>
                        <td className="py-3 px-4">
                          <button 
                            className="text-myOrage hover:text-blue-800"
                            onClick={() => handleViewDetails(appointment)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column - Calendar and Today's Appointment */}
            <div className="space-y-6">
              {/* Calendar */}
              <div className="bg-myPink p-6 rounded-lg shadow">
                <Calendar
                  onChange={handleDateChange}
                  value={date}
                  view="month"
                  prev2Label={null}
                  next2Label={null}
                  calendarType="gregory"
                  tileClassName={({ date: tileDate, view }) => 
                    view === 'month' && tileDate.getMonth() !== (date instanceof Date ? date.getMonth() : new Date().getMonth()) 
                      ? 'text-gray-400' 
                      : ''
                  }
                />
              </div>

              {/* Today's Appointment */}
              <div className="bg-myPink p-2 rounded-lg shadow">
                <h3 className="text-2xl font-semibold text-myOrage mb-4">Appointment Today</h3>
                {todayAppointment ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-myOrage">{todayAppointment.name}</p>
                      <p className="text-myOrage">{todayAppointment.time}</p>
                    </div>
                    <button 
                      className="text-myOrage hover:text-blue-800"
                      onClick={() => handleViewDetails(todayAppointment)}
                    >
                      View Details
                    </button>
                  </div>
                ) : (
                  <p className="text-myOrage">No appointments scheduled for today</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;