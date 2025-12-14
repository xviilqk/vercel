"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import "@/styles/appointments-calendar.css";
import Header from '@/components/header';
import Footer from '@/components/Footer';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  age_group?: string;
  profile_pic?: string;
}

interface Pet {
  id: number;
  name: string;
  breed: string;
  age: string;
  gender: string;
  image: string;
  size?: string;
  color?: string;
  healthCondition?: string;
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

// Create a separate component that uses useSearchParams
function AppointmentContent() {
  const searchParams = useSearchParams();
  
  const [selectedDate, setSelectedDate] = useState<Value>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isAgreementChecked, setIsAgreementChecked] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    occupation: "",
    gender: "",
    age: "",
    email: "",
    phone: "",
  });
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentStatusCount, setAppointmentStatusCount] = useState({
    pending: 0,
    approved: 0,
    declined: 0,
    total: 0
  });
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [availableTimes, setAvailableTimes] = useState([
    "9:00 AM", "9:30 AM", "10:00 AM", "11:30 AM", 
    "11:00 AM", "11:30 PM", "1:30 PM", "2:00 PM", 
    "2:30 PM", "3:00 PM", "3:30 PM"
  ]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select changes
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const petId = searchParams.get('petId');
    const petName = searchParams.get('petName');
    const petBreed = searchParams.get('petBreed');
    const petAge = searchParams.get('petAge');
    const petGender = searchParams.get('petGender');
    const petImage = searchParams.get('petImage');
    const petSize = searchParams.get('petSize');
    const petColor = searchParams.get('petColor');

    if (petId) {
      setSelectedPet({
        id: Number(petId),
        name: petName || '',
        breed: petBreed || '',
        age: petAge || '',
        gender: petGender || '',
        image: petImage || '',
        size: petSize || undefined,
        color: petColor || undefined
      });
    }
  }, [searchParams]);

  // Fetch user profile and pre-fill form if logged in
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const fetchUserProfile = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile/`, {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const userData: User = await response.json();
            setLoggedInUser({
              ...userData,
              profile_pic: userData.profile_pic || "/images/WhelpsLogo.png"
            });

            // Pre-fill form with user data
            setFormData(prev => ({
              ...prev,
              name: `${userData.first_name} ${userData.last_name}`,
              email: userData.email,
              age: userData.age_group || ""
            }));

            // Fetch user appointments
            fetchUserAppointments(token);
          } else {
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      };

      fetchUserProfile();
    }
  }, []);

  const fetchUserAppointments = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/appointments/my_appointments/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: Appointment[] = await response.json();
        setAppointments(data);
        
        // Calculate status counts
        const counts = {
          pending: data.filter(a => a.status === 'pending').length,
          approved: data.filter(a => a.status === 'approved').length,
          declined: data.filter(a => a.status === 'declined').length,
          total: data.length
        };
        setAppointmentStatusCount(counts);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !isAgreementChecked) {
      alert('Please select a date, time, and agree to the terms');
      return;
    }

    try {
      // format date in Manila timezone
      const manilaDate = selectedDate instanceof Date 
        ? new Date(selectedDate.toLocaleString("en-US", { timeZone: "Asia/Manila" }))
        : null;

      const formattedDate = manilaDate
        ? `${manilaDate.getFullYear()}-${String(manilaDate.getMonth() + 1).padStart(2, "0")}-${String(manilaDate.getDate()).padStart(2, "0")}`
        : null;

      // convert selected time to 24-hour Manila time
      const [time, period] = selectedTime.split(" ");
      const [hoursStr, minutesStr] = time.split(":");
      let hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);

      if (period === "PM" && hours !== 12) {
        hours += 12;
      } else if (period === "AM" && hours === 12) {
        hours = 0;
      }

      const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;


      const appointmentData = {
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        occupation: formData.occupation,
        age: parseInt(formData.age),
        gender: formData.gender,
        appointment_date: formattedDate,
        appointment_time: formattedTime,
        agreement_accepted: isAgreementChecked,
        pet_id: selectedPet?.id || null
      };

      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/appointments/`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        alert('Appointment booked successfully!');
        // Refresh appointments after booking
        if (token) {
          fetchUserAppointments(token);
        }
        // Reset form or redirect
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to book appointment'}`);
      }
    } catch (error) {
      console.error('Error submitting appointment:', error);
      alert('An error occurred while booking the appointment');
    }
  };

  // Update your handleDateChange function
  const handleDateChange = async (value: Value) => {
    setSelectedDate(value);
    if (value instanceof Date) {
      try {
        const formattedDate = value.toISOString().split('T')[0];
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/appointments/appointments/available_times/?date=${formattedDate}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setAvailableTimes(data.available_times);
        }
      } catch (error) {
        console.error('Error fetching available times:', error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setLoggedInUser(null);
    setAppointments([]);
    setAppointmentStatusCount({ pending: 0, approved: 0, declined: 0, total: 0 });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        loggedInUser={loggedInUser}
        favorites={[]} // Empty array since favorites aren't used in this page
        appointments={appointments}
        appointmentStatusCount={appointmentStatusCount}
        showAppointmentsModal={showAppointmentsModal}
        setShowAppointmentsModal={setShowAppointmentsModal}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="pt-16 pb-16 px-4 max-w-6xl mx-auto">
        <div className="bg-ray-50 rounded-xl p-8">
          <h1 className="text-4xl font-bold text-myOrage mb-8 text-center">Schedule Your Visit</h1>
          
          {/* Calendar and Time Slots */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            {/* Calendar */}
            <div className="bg-myPink p-2 sm:p-4 rounded-lg w-full lg:w-70%">
              <div className="flex justify-center">
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
            
            {/* Time Slots */}
            <div className="bg-myPink p-4 rounded-lg w-full lg:w-1/2">
              <h3 className="text-2xl font-semibold text-myOrage mb-4 text-center">Available Times</h3>
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-2 max-h-[450px] overflow-y-auto">
                {availableTimes.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`text-left px-3 py-2 rounded-lg flex items-center text-sm sm:text-base ${
                      selectedTime === time ? "bg-myOrage text-white" : "bg-transparent"
                    }`}
                  >
                    <span className={`inline-block w-3 h-3 border-2 mr-2 rounded-xl ${
                      selectedTime === time 
                        ? 'bg-myPink flex items-center justify-center' 
                        : 'border-gray-500'
                    }`}>
                      {selectedTime === time && (
                        <span className="block w-1.5 h-1.5 bg-myOrage rounded-xl"></span>
                      )}
                    </span>
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Form Container */}
          <div className="max-w-4xl mx-auto bg-myPink p-6 rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Pet Information Card */}
                {selectedPet && (
                  <div className="md:w-1/3 bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold text-myOrage mb-3">Pet Details</h3>
                    <div className="w-full h-48 relative rounded-lg overflow-hidden mb-4">
                      <Image 
                        src={selectedPet.image}
                        alt={selectedPet.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedPet.name}</p>
                      <p><span className="font-medium">Breed:</span> {selectedPet.breed}</p>
                      <p><span className="font-medium">Age:</span> {selectedPet.age}</p>
                      <p><span className="font-medium">Gender:</span> {selectedPet.gender}</p>
                      {selectedPet.size && <p><span className="font-medium">Size:</span> {selectedPet.size}</p>}
                      {selectedPet.color && <p><span className="font-medium">Color:</span> {selectedPet.color}</p>}
                    </div>
                  </div>
                )}

                {/* Your Information Form */}
                <div className="md:w-2/3">
                  <h2 className="text-2xl font-semibold text-myOrage mb-4">Your Information</h2>
                  
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-myOrage focus:ring-myOrage"
                      required
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleInputChange}
                        placeholder="Occupation"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-myOrage focus:ring-myOrage"
                        required
                      />
                      <input
                        type="text"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        placeholder="Age"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-myOrage focus:ring-myOrage"
                        required
                      />
                    </div>
                    
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleSelectChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-myOrage focus:ring-myOrage"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email Address"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-myOrage focus:ring-myOrage"
                      required
                    />
                    
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone Number"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-myOrage focus:ring-myOrage"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Agreement and Submit Button */}
              <div className="pt-4">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="agreement"
                    checked={isAgreementChecked}
                    onChange={() => setIsAgreementChecked(!isAgreementChecked)}
                    className="w-4 h-4 text-myOrage border-gray-300 rounded focus:ring-myOrage"
                    required
                  />
                  <label htmlFor="agreement" className="ml-2 text-sm text-gray-600">
                    I agree to the terms and conditions
                  </label>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-myOrage text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                  disabled={!selectedDate || !selectedTime || !isAgreementChecked}
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Main export with Suspense boundary
export default function AppointmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-myOrage text-xl">Loading appointment page...</div>
      </div>
    }>
      <AppointmentContent />
    </Suspense>
  );
}