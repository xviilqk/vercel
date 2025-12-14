"use client";
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Link from 'next/link';
import Image from 'next/image';
import { FaSignOutAlt } from "react-icons/fa";
import "@/styles/admin-appointments-calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

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
};

type UiAppointment = {
  id: number;
  name: string;
  petBooked: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'declined';
};

type ApiError = {
  detail?: string;
  message?: string;
};

const AdminAppointments = () => {
  const [activeTab, setActiveTab] = useState('Appointments');
  const [selectedDate, setSelectedDate] = useState<Value>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiAppointments, setApiAppointments] = useState<ApiAppointment[]>([]);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

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

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/appointments/`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Token ${token}` } : {}),
        },
      });

      if (!resp.ok) {
        const errorData: ApiError = await resp.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `Failed to fetch (${resp.status})`);
      }

      const data = await resp.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected array');
      }

      const validatedData = data.filter((item): item is ApiAppointment => (
        typeof item === 'object' && item !== null &&
        typeof item.id === 'number' &&
        typeof item.full_name === 'string' &&
        typeof item.appointment_date === 'string' &&
        typeof item.appointment_time === 'string' &&
        typeof item.status === 'string' &&
        ['pending', 'approved', 'declined'].includes(item.status)
      ));
      setApiAppointments(validatedData);
    } catch (e) {
      console.error('Fetch error:', e);
      setError(e instanceof Error ? e.message : 'Failed to fetch appointments');
      setApiAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const uiAppointments: UiAppointment[] = useMemo(() => {
    return apiAppointments.map(a => ({
      id: a.id,
      name: a.full_name,
      petBooked: a.pet_id ? `Pet #${a.pet_id}` : '-',
      date: formatDateForUi(a.appointment_date),
      time: formatTimeForUi(a.appointment_time),
      status: a.status,
    }));
  }, [apiAppointments]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user_role');
    localStorage.removeItem('admin_is_staff');
    window.location.href = '/admin/login';
  };

  const pendingAppointments = uiAppointments.filter(a => a.status === 'pending');
  const approvedAppointments = uiAppointments.filter(a => a.status === 'approved');
  const declinedAppointments = uiAppointments.filter(a => a.status === 'declined');

  const handleDateChange = (value: Value) => {
    setSelectedDate(value);
  };

  const postAction = async (id: number, action: 'approve' | 'decline') => {
    if (!token) {
      alert('You must be logged in as admin.');
      return;
    }
    try {
      // optional: ask admin for a note to include in email
      let admin_note = '';
      if (action === 'decline') {
        admin_note = prompt('Enter reason for declining (optional):') || '';
      }
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/appointments/${id}/${action}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(admin_note ? { admin_note } : {}),
      });

      if (!resp.ok) {
        const errorData: ApiError = await resp.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `Failed to ${action}`);
      }

      await fetchAppointments();
    } catch (e) {
      console.error(`${action} error:`, e);
      alert(e instanceof Error ? e.message : `Failed to ${action}`);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="m-auto text-center">
          <div className="text-2xl text-myOrage">Loading appointments...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="m-auto text-center">
          <div className="text-2xl text-red-500">Error: {error}</div>
          <button 
            onClick={fetchAppointments}
            className="mt-4 bg-myOrage text-white px-4 py-2 rounded-md hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
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

        {/* Appointments Content */}
        <main className="p-6">
          {/* Top Row - Summary and Calendar */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Total Appointments - Now horizontal */}
            <div className="rounded-lg w-full">
              <div className="flex flex-wrap text-center gap-4">
                <div className="bg-myPink p-4 shadow rounded-lg flex-1 min-w-[200px]">
                  <p className="text-myOrage text-xl">Total Appointment</p>
                  <p className="text-3xl font-bold text-myOrage">{uiAppointments.length}</p>
                </div>
                <div className="bg-myPink p-4 shadow rounded-lg flex-1 min-w-[200px]">
                  <p className="text-myOrage text-xl">Pending Appointment</p>
                  <p className="text-3xl font-bold text-myOrage">{pendingAppointments.length}</p>
                </div>
                <div className="bg-myPink p-4 shadow rounded-lg flex-1 min-w-[200px]">
                  <p className="text-myOrage text-xl">Completed Appointment</p>
                  <p className="text-3xl font-bold text-myOrage">{approvedAppointments.length}</p>
                </div>
              </div>
            </div>
          </div>
          
          <h3 className="text-2xl font-semibold text-myOrage mb-4">Pending Appointments</h3>
          
          {/* Second Row - Pending Appointments and Calendar */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Pending Appointments */}
            <div className="bg-white p-4 rounded-lg shadow flex-1">
              {pendingAppointments.length > 0 ? (
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2 text-myOrage font-medium">Name</th>
                      <th className="text-left py-2 text-myOrage font-medium">Pet</th>
                      <th className="text-left py-2 text-myOrage font-medium">Date</th>
                      <th className="text-left py-2 text-myOrage font-medium">Time</th>
                      <th className="text-left py-2 text-myOrage font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingAppointments.map((appointment) => (
                      <tr key={appointment.id} className="border-t">
                        <td className="py-2 text-myOrage">{appointment.name}</td>
                        <td className="py-2 text-myOrage">{appointment.petBooked}</td>
                        <td className="py-2 text-myOrage">{appointment.date}</td>
                        <td className="py-2 text-myOrage">{appointment.time}</td>
                        <td className="py-2 text-myOrage space-x-2">
                          <button
                            className="px-3 py-1 rounded bg-green-500 text-white"
                            onClick={() => postAction(appointment.id, 'approve')}
                          >
                            Approve
                          </button>
                          <button
                            className="px-3 py-1 rounded bg-red-500 text-white"
                            onClick={() => postAction(appointment.id, 'decline')}
                          >
                            Decline
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-4 text-myOrage">
                  No pending appointments
                </div>
              )}
            </div>

            {/* Calendar */}
            <div className="bg-myPink p-4 rounded-lg w-full md:w-1/3 max-w-xl">
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                className="border-none bg-transparent w-full"
                view="month"
                minDetail="year"
                showNeighboringMonth={true}
                calendarType="gregory"
                formatShortWeekday={(_locale, date) => 
                  ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()]
                }
                tileDisabled={() => false}
              />
            </div>
          </div>

          {/* Bottom Row - Appointments Tables */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-myOrage mb-4">Appointment History</h3>
            
            {/* Approved Appointments */}
            <div className="bg-white p-4 rounded-t-lg shadow">
              {approvedAppointments.length > 0 ? (
                <table className="min-w-full">
                  <thead>
                    <tr className="text-myOrage items-center">
                      <th className="text-left py-2 font-medium">Name</th>
                      <th className="text-left py-2 font-medium">Pet</th>
                      <th className="text-left py-2 font-medium">Date</th>
                      <th className="text-left py-2 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedAppointments.map((appointment) => (
                      <tr key={appointment.id} className="border-t">
                        <td className="py-2 text-myOrage">{appointment.name}</td>
                        <td className="py-2 text-myOrage">{appointment.petBooked}</td>
                        <td className="py-2 text-myOrage">{appointment.date}</td>
                        <td className="py-2 text-myOrage">{appointment.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-4 text-myOrage">
                  No approved appointments yet
                </div>
              )}
            </div>

            {/* Declined Appointments */}
            {declinedAppointments.length > 0 && (
              <div className="bg-white p-4 rounded-b-lg shadow">
                <h4 className="text-xl font-semibold text-myOrage mb-3">Declined</h4>
                <table className="min-w-full">
                  <thead>
                    <tr className="text-myOrage items-center">
                      <th className="text-left py-2 font-medium">Name</th>
                      <th className="text-left py-2 font-medium">Pet</th>
                      <th className="text-left py-2 font-medium">Date</th>
                      <th className="text-left py-2 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {declinedAppointments.map((appointment) => (
                      <tr key={appointment.id} className="border-t">
                        <td className="py-2 text-myOrage">{appointment.name}</td>
                        <td className="py-2 text-myOrage">{appointment.petBooked}</td>
                        <td className="py-2 text-myOrage">{appointment.date}</td>
                        <td className="py-2 text-myOrage">{appointment.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAppointments;