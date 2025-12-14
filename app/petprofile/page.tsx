"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaHeart,
  FaSignOutAlt,
} from "react-icons/fa";

/** Match the backend payload fields you actually use */
export interface Pet {
  id: number;
  name: string;
  breed: string;
  age: number | string;
  gender: string;
  size: string;
  color: string;
  healthCondition?: string | null;
  story?: string | null;
  status: string;
  type: string;
  vaccinated?: boolean;
  image?: string | null; // can be null from backend
}

interface PetProfileProps {
  pet: Pet | null; // Allow pet to be null
}

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  age_group?: string;
  profile_pic?: string | null;
}

const PetProfile: React.FC<PetProfileProps> = ({ pet }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdoptOpen, setIsAdoptOpen] = useState(false);
  const [isMobileAdoptOpen, setIsMobileAdoptOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Handle case where pet is null/undefined
  const petImage = pet?.image
    ? (typeof pet.image === "string" && pet.image.trim().length > 0
        ? pet.image
        : "/images/dogcat.png")
    : "/images/dogcat.png";

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      fetchUserProfile(token);
    }

    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch {
        // reset if corrupted
        localStorage.removeItem("favorites");
      }
    }
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
          cache: "no-store",
        }
      );

      if (response.ok) {
        const userData: User = await response.json();
        setLoggedInUser({
          ...userData,
          profile_pic: userData.profile_pic || "/images/default-profile.png",
        });
      } else {
        localStorage.removeItem("auth_token");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Show loading state if pet is not available
  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-myOrage text-xl">Loading pet profile...</div>
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
                priority
              />
            </div>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="block lg:hidden text-myOrage"
            aria-label="Toggle menu"
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

              <Link
                href="/about"
                className="text-myOrage hover:text-blue-600 transition-colors"
              >
                ABOUT
              </Link>
              <Link
                href="/#contacts"
                className="text-myOrage hover:text-blue-600 transition-colors"
              >
                CONTACTS
              </Link>
              <Link
                href="/appointments"
                className="text-myOrage hover:text-blue-600 transition-colors"
              >
                APPOINTMENTS
              </Link>
            </div>

            {loggedInUser ? (
              <div className="relative ml-8" ref={profileDropdownRef}>
                <button
                  onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                  }
                  className="flex items-center space-x-2 focus:outline-none"
                  aria-haspopup="menu"
                  aria-expanded={isProfileDropdownOpen}
                >
                  <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-myOrage relative">
                    <Image
                      src={
                        loggedInUser.profile_pic || "/images/default-profile.png"
                      }
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
                      <p className="text-sm font-medium text-gray-900">
                        Hi, {loggedInUser.first_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {loggedInUser.email}
                      </p>
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
                          {favorites.length}{" "}
                          {favorites.length === 1 ? "pet" : "pets"} saved
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
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${
          isMenuOpen ? "block" : "hidden"
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div
          className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg p-6"
          onClick={(e) => e.stopPropagation()}
        >
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

            <Link
              href="/about"
              className="text-myOrage hover:text-blue-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              ABOUT
            </Link>
            <Link
              href="/#contacts"
              className="text-myOrage hover:text-blue-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              CONTACTS
            </Link>
            <Link
              href="/appointments"
              className="text-myOrage hover:text-blue-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              APPOINTMENTS
            </Link>
            {loggedInUser ? (
              <>
                <Link
                  href="/favorites"
                  className="text-myOrage hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
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

      {/* Pet Profile Content */}
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Pet Image */}
            <div className="md:w-1/3 relative aspect-square">
              <Image
                src={petImage}
                alt={`Photo of ${pet.name} the ${pet.breed}`}
                className="rounded-lg object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
              {/* Favorite Button */}
              <button
                onClick={() => toggleFavorite(pet.id)}
                className="absolute top-2 right-2 bg-white/80 p-2 rounded-full"
                aria-label={
                  favorites.includes(pet.id)
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
              >
                <FaHeart
                  className={`text-2xl ${
                    favorites.includes(pet.id)
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                />
              </button>
            </div>

            {/* Pet Details */}
            <div className="md:w-2/3">
              <header className="mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                  {pet.name}
                </h1>

                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                    pet.status === "Available"
                      ? "bg-green-100 text-green-800"
                      : pet.status === "In Trial"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {pet.status}
                </span>
              </header>

              {/* Pet Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Breed
                  </h3>
                  <p className="text-gray-800 mt-1">{pet.breed}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </h3>
                  <p className="text-gray-800 mt-1">{pet.age}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </h3>
                  <p className="text-gray-800 mt-1">{pet.gender}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </h3>
                  <p className="text-gray-800 mt-1">{pet.size}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Color/Markings
                  </h3>
                  <p className="text-gray-800 mt-1">{pet.color}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Health Condition
                  </h3>
                  <p className="text-gray-800 mt-1">
                    {pet.healthCondition || "None"}
                  </p>
                </div>
              </div>

              {/* Schedule Button */}
              <Link
                href={{
                  pathname: "/appointments",
                  query: {
                    petId: pet.id,
                    petName: pet.name,
                    petBreed: pet.breed,
                    petAge: String(pet.age),
                    petGender: pet.gender,
                    petImage: petImage,
                    petSize: pet.size,
                    petColor: pet.color,
                  },
                }}
              >
                <button
                  className="w-full sm:w-auto bg-myOrage hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg mb-6 transition duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  aria-label={`Schedule a visit to meet ${pet.name}`}
                >
                  Schedule a Visit
                </button>
              </Link>

              {/* Pet Story */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  {pet.name} Story
                </h2>
                <div className="prose prose-sm text-gray-600">
                  <p>{pet.story}</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Sections */}
      <footer id="contacts" className="bg-myOrage text-white py-6 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          {/* Logo Column */}
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

          {/* Contact Us Column */}
          <div className="flex flex-col space-y-2 text-sm md:items-start items-center">
            <h4 className="text-lg font-bold">Contact Us</h4>
            <p className="flex items-center gap-2">
              <FaMapMarkerAlt /> Pullian, Bulacan
            </p>
            <p className="flex items-center gap-2">
              <FaEnvelope /> whelps@gmail.com
            </p>
            <p className="flex items-center gap-2">
              <FaPhone /> 0951 718 7064
            </p>
          </div>

          {/* Information Column */}
          <div className="flex flex-col space-y-2 text-sm md:items-start items-center">
            <h4 className="text-lg font-bold">Information</h4>
            <Link href="/" className="hover:text-black">
              Home
            </Link>
            <Link href="/about" className="hover:text-black">
              About Us
            </Link>
            <Link href="/faqs" className="hover:text-black">
              FAQs
            </Link>
            <Link href="/privacy" className="hover:text-black">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-black">
              Terms of Service
            </Link>
            <Link href="/policies" className="hover:text-black">
              Shelter Policies
            </Link>
          </div>

          {/* CTA Column */}
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

        {/* Copyright */}
        <div className="max-w-6xl mx-auto border-t border-gray-700 pt-3 text-center mt-3">
          <p className="text-[10px] text-gray-300">
            © {new Date().getFullYear()} WHELPS. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PetProfile;