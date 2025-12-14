"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaHeart } from "react-icons/fa";
import Header from '@/components/header';
import Footer from '@/components/Footer';

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

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  age_group?: string;
  profile_pic?: string;
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

export default function CatsPage() {
  const [cats, setCats] = useState<Pet[]>([]);
  const [filteredCats, setFilteredCats] = useState<Pet[]>([]);
  const [activeTab, setActiveTab] = useState<"All" | "Available" | "In Trial" | "Adopted">("All");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const catsPerPage = 9;
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentStatusCount, setAppointmentStatusCount] = useState({
    pending: 0,
    approved: 0,
    declined: 0,
    total: 0
  });
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
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
          image: p.image ? new URL(p.image, process.env.NEXT_PUBLIC_API_URL).toString() : '/images/dogcat.png',
          status: p.status,
          type: p.type,
          story: p.story,
        }));
        const catList = mapped.filter((pet) => pet.type === "cat");
        setCats(catList);
        setFilteredCats(catList);
      } catch (error) {
        console.error('Error fetching cats:', error);
      }
    };

    fetchCats();

    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchUserProfile(token);
      fetchUserAppointments(token);
    }

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    // Save favorites to localStorage when they change
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (activeTab === "All") {
      setFilteredCats(cats);
    } else {
      setFilteredCats(cats.filter((cat) => cat.status === activeTab));
    }
    setCurrentPage(1);
  }, [activeTab, cats]);

  const fetchUserProfile = async (token: string) => {
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
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

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

  const toggleFavorite = (petId: number) => {
    setFavorites((prev) =>
      prev.includes(petId) ? prev.filter((id) => id !== petId) : [...prev, petId]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setLoggedInUser(null);
    setAppointments([]);
    setAppointmentStatusCount({ pending: 0, approved: 0, declined: 0, total: 0 });
  };

  const totalPages = Math.ceil(filteredCats.length / catsPerPage);
  const displayedCats = filteredCats.slice(
    (currentPage - 1) * catsPerPage,
    currentPage * catsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        loggedInUser={loggedInUser}
        favorites={favorites}
        appointments={appointments}
        appointmentStatusCount={appointmentStatusCount}
        showAppointmentsModal={showAppointmentsModal}
        setShowAppointmentsModal={setShowAppointmentsModal}
        handleLogout={handleLogout}
      />

      {/* Filter Tabs */}
      <div className="flex justify-center space-x-6 mt-28">
        {["All", "Available", "In Trial", "Adopted"].map((tab) => (
          <button
            key={tab}
            className={`text-lg font-semibold ${
              activeTab === tab 
                ? "text-myOrage border-b-2 border-myOrage" 
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab(tab as "All" | "Available" | "In Trial" | "Adopted")}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Cats Grid */}
      <section className="px-4 mt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-24">
          {displayedCats.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg relative">
              {/* Cat Image with Link */}
              <Link href={`/pets/${cat.id}`} className="block">
                <Image 
                  src={cat.image} 
                  alt={cat.name} 
                  width={300} 
                  height={200} 
                  className="w-full h-64 object-cover" 
                />
              </Link>

              {/* Status Tag */}
              <div className="absolute top-3 right-3 bg-myOrage text-white text-sm px-3 py-1 rounded-lg">
                {cat.status}
              </div>

              {/* Cat Details */}
              <div className="p-6 bg-myOrage text-white relative">
                <h4 className="text-xl font-semibold">{cat.name}</h4>
                <p className="text-sm">{cat.details}</p>

                {/* Heart Favorite Button */}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(cat.id);
                  }} 
                  className="absolute top-4 right-4 text-2xl"
                >
                  <FaHeart className={favorites.includes(cat.id) ? "text-red-500" : "text-white"} />
                </button>

                {/* Meet Button */}
                <Link
                  href={`/pets/${cat.id}`}
                  className="w-full mt-4 py-2 bg-white text-myOrage font-semibold rounded-full hover:bg-gray-200 transition duration-200 block text-center"
                >
                  Meet {cat.name}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2 mb-12">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full font-semibold ${
                  currentPage === index + 1 
                    ? "bg-myOrage text-white" 
                    : "bg-gray-200 text-gray-600"
                }`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}