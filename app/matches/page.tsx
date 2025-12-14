"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaHeart,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
} from "react-icons/fa";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  age_group?: string;
  profile_pic?: string;
}

interface PetMatch {
  pet_id: number;
  name: string;
  breed: string;
  type: string;
  image?: string;
  match: number;
}

interface MatchResults {
  top_matches: PetMatch[];
  other_matches: PetMatch[];
  adopter_name: string;
}

export default function MatchResultsPage() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdoptOpen, setIsAdoptOpen] = useState(false);
  const [isMobileAdoptOpen, setIsMobileAdoptOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [matchResults, setMatchResults] = useState<MatchResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) fetchUserProfile(token);

    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

    fetchMatchResults();
  }, []);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile/`,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const userData: User = await response.json();
        setLoggedInUser({
          ...userData,
          profile_pic:
            userData.profile_pic ||
            "/images/WhelpsLogo.png",
        });
      } else {
        localStorage.removeItem("auth_token");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchMatchResults = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const adopterId = localStorage.getItem("adopter_id");
      if (!adopterId) {
        setError("No assessment data found. Please complete the assessment first.");
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/matching/adopters/${adopterId}/match-pets/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const results: MatchResults = await response.json();

        // Map and fix image URLs (same approach as AdminPets)
        const mapPets = (pets: PetMatch[]) =>
          pets.map((p) => ({
            ...p,
            image: p.image
              ? new URL(p.image, process.env.NEXT_PUBLIC_API_URL).toString()
              : "/images/dogcat.png",
          }));

        setMatchResults({
          ...results,
          top_matches: mapPets(results.top_matches),
          other_matches: mapPets(results.other_matches),
        });
      } else {
        setError("Failed to fetch match results. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching match results:", error);
      setError("An error occurred while fetching your matches. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = (petId: number) => {
    setFavorites((prev) =>
      prev.includes(petId)
        ? prev.filter((id) => id !== petId)
        : [...prev, petId]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setLoggedInUser(null);
    setIsProfileDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-myOrage mx-auto"></div>
          <p className="mt-4 text-xl text-myOrage">Finding your perfect matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Oops!</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/assessment">
            <button className="bg-myOrage text-white px-6 py-3 rounded-full hover:bg-orange-600 transition-colors">
              Take Assessment Again
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
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

              <Link href="/about" className="text-myOrage hover:text-blue-600 transition-colors">
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
              <div className="relative ml-8" ref={profileDropdownRef}>
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-myOrage relative">
                    <Image 
                      src={loggedInUser.profile_pic || "/images/WhelpsLogo.png"} 
                      alt="Profile" 
                      width={40} 
                      height={40} 
                      className="object-cover"
                    />
                  </div>
                </button>
                
                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium text-gray-900">Hi, {loggedInUser.first_name}</p>
                      <p className="text-xs text-gray-500 truncate">{loggedInUser.email}</p>
                    </div>
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

      {/* Main Content */}
      <main className="pt-48 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-myOrage mb-4">
              Your Perfect Matches, {matchResults?.adopter_name || 'Friend'}!
            </h1>
            <p className="text-lg text-gray-600">
              Based on your assessment, here are the pets that best match your lifestyle and preferences.
            </p>
          </div>

          {/* Top Matches Section */}
          {matchResults?.top_matches && matchResults.top_matches.length > 0 && (
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-myOrage text-center mb-8">
                🏆 Top Matches (85%+ Compatibility)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {matchResults.top_matches.map((pet) => (
                  <div key={pet.pet_id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
                    {/* Pet Image */}
                    <Link href={`/api/pets/${pet.pet_id}`} className="block">
                      <div className="relative h-64 w-full">
                        <Image 
                          src={pet.image || "/images/dogcat.png"} 
                          alt={pet.name} 
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>

                    {/* Match Percentage Badge */}
                    <div className="absolute top-3 left-3 bg-green-500 text-white text-sm px-3 py-1 rounded-lg font-bold">
                      {pet.match}% Match
                    </div>

                    {/* Pet Details */}
                    <div className="p-6 bg-myOrage text-white relative">
                      <h3 className="text-2xl font-bold">{pet.name}</h3>
                      <p className="text-sm mt-2">{pet.breed} • {pet.type}</p>
                      
                      {/* Heart Favorite Button */}
                      <button 
                        onClick={() => toggleFavorite(pet.pet_id)}
                        className="absolute top-4 right-4 text-2xl"
                      >
                        <FaHeart className={favorites.includes(pet.pet_id) ? "text-red-500" : "text-white"} />
                      </button>

                      {/* Meet Button */}
                      <Link
                        href={`/pets/${pet.pet_id}`}
                        className="w-full mt-4 py-2 bg-white text-myOrage font-semibold rounded-full hover:bg-gray-200 transition duration-200 block text-center"
                      >
                        Meet {pet.name}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* You Might Also Like Section */}
          {matchResults?.other_matches && matchResults.other_matches.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-myOrage text-center mb-8">
                You Might Also Like (50-84% Compatibility)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {matchResults.other_matches.map((pet) => (
                  <div key={pet.pet_id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
                    {/* Pet Image */}
                    <Link href={`/pets/${pet.pet_id}`} className="block">
                      <div className="relative h-64 w-full">
                        <Image 
                          src={pet.image || "/images/dogcat.png"} 
                          alt={pet.name} 
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>

                    {/* Match Percentage Badge */}
                    <div className="absolute top-3 left-3 bg-blue-500 text-white text-sm px-3 py-1 rounded-lg font-bold">
                      {pet.match}% Match
                    </div>

                    {/* Pet Details */}
                    <div className="p-6 bg-myOrage text-white relative">
                      <h3 className="text-2xl font-bold">{pet.name}</h3>
                      <p className="text-sm mt-2">{pet.breed} • {pet.type}</p>
                      
                      {/* Heart Favorite Button */}
                      <button 
                        onClick={() => toggleFavorite(pet.pet_id)}
                        className="absolute top-4 right-4 text-2xl"
                      >
                        <FaHeart className={favorites.includes(pet.pet_id) ? "text-red-500" : "text-white"} />
                      </button>

                      {/* Meet Button */}
                      <Link
                        href={`/pets/${pet.pet_id}`}
                        className="w-full mt-4 py-2 bg-white text-myOrage font-semibold rounded-full hover:bg-gray-200 transition duration-200 block text-center"
                      >
                        Meet {pet.name}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* No Matches Message */}
          {(!matchResults?.top_matches || matchResults.top_matches.length === 0) && 
           (!matchResults?.other_matches || matchResults.other_matches.length === 0) && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🐾</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">No Matches Found</h2>
              <p className="text-gray-600 mb-6">
                We couldnt find any pets that match your current preferences. 
                Try adjusting your answers or check back later for new pets!
              </p>
              <Link href="/assessment">
                <button className="bg-myOrage text-white px-6 py-3 rounded-full hover:bg-orange-600 transition-colors">
                  Retake Assessment
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer id="contacts" className="bg-myOrage text-white py-6 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left"> 
          <div className="flex justify-center md:justify-start">
            <div className="h-32 w-32 md:h-48 md:w-48">
              <Image 
                src="/images/Whelpswhite.png"
                alt="WHELPS Logo"
                width={192}
                height={192}
                className="object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2 text-sm md:items-start items-center"> 
            <h4 className="text-lg font-bold">Contact Us</h4>
            <p className="flex items-center gap-2"><FaMapMarkerAlt /> Pullian, Bulacan</p>
            <p className="flex items-center gap-2"><FaEnvelope /> whelps@gmail.com</p>
            <p className="flex items-center gap-2"><FaPhone /> 0951 718 7064</p>
          </div>

          <div className="flex flex-col space-y-2 text-sm md:items-start items-center"> 
            <h4 className="text-lg font-bold">Information</h4>
            <Link href="/" className="hover:text-black">Home</Link>
            <Link href="/about" className="hover:text-black">About Us</Link>
            <Link href="/faqs" className="hover:text-black">FAQs</Link>
            <Link href="/privacy" className="hover:text-black">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-black">Terms of Service</Link>
            <Link href="/policies" className="hover:text-black">Shelter Policies</Link>
          </div>

          <div className="flex flex-col items-center md:items-start space-y-2">
            <h4 className="text-lg font-bold text-center md:text-left">
              Your Fur-ever <span className="block">Friend is Waiting!</span>
            </h4>
            <Link href="/assessment">
              <button className="bg-white text-myOrage px-8 py-3 rounded-full font-semibold hover:bg-orange-600 hover:text-white transition-colors">
                Start Matching
              </button>
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-gray-700 pt-3 text-center mt-3">
          <p className="text-[10px] text-gray-300">© 2025 WHELPS. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}