"use client";
import { useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaHeart, 
} from "react-icons/fa";
import Header from '@/components/header';
import Footer from '@/components/Footer';

interface Pet {
  id: number;
  name: string;
  details: string;
  image: string;
  type: "dog" | "cat";
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

export default function HomePage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    const fetchPets = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pets/`);
        const data = await response.json();
        console.log("API response:", data);
        const mapped: Pet[] = data.map((p: ApiPet) => ({
          id: p.id,
          name: p.name,
          details: `${p.gender} / ${p.age} / ${p.breed}`,
          image: p.image ? new URL(p.image, process.env.NEXT_PUBLIC_API_URL).toString() : '/images/WhelpsLogo.png',
          type: p.type,
        }));
        setPets(mapped);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching pets:', error);
        setIsLoading(false);
      }
    };

    fetchPets();

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

      {/* New Hero Section */}
      <section className="pt-16 pb-16 px-4 bg-gray-50 relative">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Image Container - Left Side */}
          <div className="h-auto md:h-[500px] lg:h-[600px] overflow-hidden md:-ml-8 lg:-ml-24 transform md:translate-x-4">
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Image
                src="/images/FrontpagePet.png"
                alt="Happy pet"
                className="w-full h-auto md:w-[600px] lg:w-[700px]"
                width={900}
                height={700}
              />
            </div>
          </div>

          {/* Text Content - Right Side */}
          <div className="md:ml-8 lg:ml-32 transform md:-translate-x-4">
            {/* Right-aligned heading with paw */}
            <div className="text-right">
              <div className="flex justify-end items-baseline relative">
                {/* Paw positioned slightly lower */}
                <div className="w-11 h-11 mr-3 mb-1 transform translate-y-1 translate-x-3">
                  <Image
                    src="/images/PawPrint.png"
                    alt="Paw decoration"
                    width={46}
                    height={46}
                    className="-rotate-12"
                  />
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-myOrage">
                  Find your
                </h1>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-myOrage mt-2">
                Fur-fect Match
              </h1>
            </div>

            {/* Center-aligned description and button */}
            <div className="text-center mt-8 space-y-8">
              <p className="text-xl font-semibold text-black px-4 md:px-0">
                Discover pets that match your personality
                and lifestyle.
              </p>
              <div>
                <Link href="/assessment">
                  <button className="bg-myOrage text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors">
                    Start Matching
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section id='about' className="py-16 px-4 bg-myOrage relative">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Text Content - Left Side */}
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold text-white">
              WELCOME TO
              <span className="block text-white mt-2">WHELPS</span>
            </h2>
            <p className="text-2xl text-white">
              A non-profit organization that aims to create a safe and happy environment for cats & dogs.
            </p>
          </div>

          {/* Image Container - Right Side with absolute positioned paws underneath */}
          <div className="h-64 md:h-96 overflow-hidden order-first md:order-last relative">
            {/* Welcome Photo */}
            <Image
              src="/images/WelcomePhoto.png"
              alt="Our shelter animals"
              className="w-full h-full object-cover relative z-10"
              width={800}
              height={600}
            />
            
            {/* Top Paw - positioned under image */}
            <div className="absolute top-2 left-24 md:left-40 w-16 h-16 z-0">
              <Image
                src="/images/PawPrintWhite.png"
                alt="Decorative paw"
                width={64}
                height={64}
                className="rotate-[-25deg]"
              />
            </div>
            
            {/* Bottom Paw - positioned under image */}
            <div className="absolute bottom-3 right-24 md:right-40 w-16 h-16 z-0">
              <Image
                src="/images/PawPrintWhite.png"
                alt="Decorative paw"
                width={64}
                height={64}
                className="rotate-[25deg]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-5xl text-myOrage font-bold mb-12 text-center">How it Works?</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 items-center justify-center">
            {[
              {
                image: "/images/Matching.png",
                text: "Take the Compatibility Test",
              },
              {
                image: "/images/Matched.png",
                text: "Get Matched with a Pet",
              },
              {
                image: "/images/Profile.png",
                text: "View Pet Profile & Availability",
              },
              {
                image: "/images/Appointment.png",
                text: "Schedule a Meet-Up",
              },
            ].map((step, index) => (
              <div key={index} className="text-center p-4">
                <Image
                  src={step.image}
                  alt={step.text}
                  width={150}
                  height={150}
                  className="mx-auto mb-6"
                />
                <p className="text-myOrage font-bold text-lg">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pets Grid */}
      <section id="browse" className="py-12 px-4 relative overflow-x-hidden overflow-y-hidden bg-gray-50">
        <h3 className="text-5xl text-myOrage font-bold mb-9 text-center">Who are Waiting for You?</h3>

        {/* Left Paw */}
        <div className="absolute left-0 top-[38%] hidden lg:block" style={{
          transform: 'rotate(65deg)',
          width: '180px',
          height: '180px',
          marginLeft: '-30px'
        }}>
          <Image 
            src="/images/PawPrint.png"
            alt="Left paw"
            width={180}
            height={180}
            className="absolute inset-0"
          />
        </div>

        {/* Right Paw */}
        <div className="absolute right-0 bottom-[2%] hidden lg:block" style={{
          transform: 'rotate(-55deg)',
          width: '170px',
          height: '170px',
          marginRight: '-30px'
        }}>
          <Image 
            src="/images/PawPrint.png"
            alt="Right paw"
            width={160}
            height={160}
            className="absolute inset-0"
          />
        </div>

        <div className="relative z-10">
          {isLoading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : (
            <>
              {/* Dogs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {pets
                  .filter((pet) => pet.type === "dog")
                  .slice(0, 3)
                  .map((pet) => (
                    <div key={pet.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg relative">
                      <Image src={pet.image} alt={pet.name} width={300} height={200} className="w-full h-64 object-cover" />
                      <div className="p-6 bg-myOrage text-white relative">
                        <h4 className="text-xl font-semibold">{pet.name}</h4>
                        <p className="text-sm">{pet.details}</p>
                        <button onClick={() => toggleFavorite(pet.id)} className="absolute top-4 right-4 text-2xl">
                          <FaHeart className={favorites.includes(pet.id) ? "text-red-500" : "text-white"} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* More Dogs Button */}
              <div className="text-center mt-6 mb-12">
                <Link href="/dogs">
                  <button className="bg-myOrage text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition-colors">
                    MORE
                  </button>
                </Link>
              </div>

              {/* Cats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-8">
                {pets
                  .filter((pet) => pet.type === "cat")
                  .slice(0, 3)
                  .map((pet) => (
                    <div key={pet.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg relative">
                      <Image src={pet.image} alt={pet.name} width={300} height={200} className="w-full h-64 object-cover" />
                      <div className="p-6 bg-myOrage text-white relative">
                        <h4 className="text-xl font-semibold">{pet.name}</h4>
                        <p className="text-sm">{pet.details}</p>
                        <button onClick={() => toggleFavorite(pet.id)} className="absolute top-4 right-4 text-2xl">
                          <FaHeart className={favorites.includes(pet.id) ? "text-red-500" : "text-white"} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* More Cats Button */}
              <div className="text-center mt-6">
                <Link href="/cats">
                  <button className="bg-myOrage text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition-colors">
                    MORE
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Shelter Video Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Video on the left */}
          <div className="aspect-w-16 aspect-h-9 w-full rounded-xl overflow-hidden shadow-2xl">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/videos/whelps-pets.mp4" type="video/mp4" />
              Your browser does not support HTML5 video.
            </video>
          </div>

          {/* Text content on the right */}
          <div className="space-y-6 text-center md:text-left">
            <h3 className="text-3xl text-center md:text-4xl font-bold text-myOrage">
              Every pet deserves a second chance.
            </h3>
            <p className="text-xl text-center text-gray-700">
              Watch their stories.
            </p>
          </div>
        </div>
      </section>

      <section className="pt-12 px-4 bg-myPink pb-0">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-5xl md:text-6xl font-bold text-myOrage mb-8 text-center">
            Benefits of Adopting a Pet
          </h3>
          
          <div className="w-full max-w-4xl mx-auto">
            <Image
              src="/images/Benefit.png"
              alt="Benefits of pet adoption"
              width={800}
              height={600}
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}