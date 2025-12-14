import Link from 'next/link';
import Image from 'next/image';
import { FaMapMarkerAlt, FaEnvelope, FaPhone } from "react-icons/fa";

export default function Footer() {
  return (
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
          <p className="flex items-center gap-2"><FaMapMarkerAlt /> Pullian, Bulacan</p>
          <p className="flex items-center gap-2"><FaEnvelope /> whelps@gmail.com</p>
          <p className="flex items-center gap-2"><FaPhone /> 0951 718 7064</p>
        </div>

        {/* Information Column */}
        <div className="flex flex-col space-y-2 text-sm md:items-start items-center"> 
          <h4 className="text-lg font-bold">Information</h4>
          <Link href="/" className="hover:text-black">Home</Link>
          <Link href="/#about" className="hover:text-black">About Us</Link>
          <Link href="/faqs" className="hover:text-black">FAQs</Link>
          <Link href="/privacy" className="hover:text-black">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-black">Terms of Service</Link>
          <Link href="/policies" className="hover:text-black">Shelter Policies</Link>
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
        <p className="text-[10px] text-gray-300">© 2025 WHELPS. All Rights Reserved.</p>
      </div>
    </footer>
  );
}