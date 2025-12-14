import Image from 'next/image';
import '../app/globals.css';
export default function HomePage() {
    const pets = [
      { name: "Haru", details: "About 7 months old / Deloitte" },
      { name: "Milo", details: "About 7 years old / German" },
      { name: "Molly", details: "Female / 2 months old / Pau" },
      { name: "Theo", details: "Home" },
      { name: "Nala", details: "Home" },
      { name: "Cleo", details: "More in practice and Friend" },
    ];
  
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="fixed w-full top-0 bg-white shadow-md z-50">
          <div className="px-6 py-4 flex items-center justify-between">
            {" "}
            {/* Reduced from px-8/px-4 */}
            {/* Round Logo - Left side */}
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-blue-600">
                <Image 
                  src=""
                  alt="WHELPS Logo"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            {/* Right side container */}
            <div className="flex items-center space-x-6">
              {/* Navigation links */}
              <div className="hidden md:flex items-center space-x-6">
                {["DOGS", "CATS", "ABOUT", "CONTACTS", "APPOINTMENTS"].map(
                  (item) => (
                    <a
                      key={item}
                      className="text-myOrage hover:text-blue-600 transition-colors"
                    >
                      {item}
                    </a>
                  ),
                )}
              </div>
  
              {/* Login button */}
              <button className="bg-myOrage text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors ml-6">
                LOGIN
              </button>
            </div>
          </div>
        </nav>
  
        {/* New Hero Section */}
        <section className="pt-36 pb-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Image Container - Left Side with right margin */}
            <div className="h-96 bg-white rounded-xl overflow-hidden md:-ml-8 lg:-ml-24 transform md:translate-x-4">
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Image 
                  src="/images/dogcat.png"
                  alt="WHELPS"
                />
              </div>
            </div>
  
            {/* Text Content - Right Side with left margin */}
            <div className="text-left space-y-6 md:ml-8 lg:ml-32 transform md:-translate-x-4">
              <h1 className="text-4xl md:text-5xl font-bold text-myOrage">
                Find your
                <span className="block mt-2 text-myOrage">Fur-fect Match</span>
              </h1>
              <p className="text-xl text-black">
                Discover pets that match your personality
                <span className="block">and lifestyle.</span>
              </p>
              <button className="bg-myOrage text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors">
                Start Matching
              </button>
            </div>
          </div>
        </section>
  
        {/* Welcome Section */}
        <section className="py-12 px-4 text-center bg-myOrage">
          <h2 className="text-3xl font-bold mb-6">WELCOME TO WHELPS</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A non-profit organization that aims to create a safe and happy
            environment for cats & dogs.
          </p>
        </section>
  
        {/* How it Works */}
        <section className="py-12 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-8 text-center">How it Works?</h3>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                "Take the Compatibility Test",
                "Get Matched with a Pet",
                "View Pet Profile & Availability",
                "Schedule a Meet-Up",
              ].map((step, index) => (
                <div key={index} className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* Pets Grid */}
        <section className="py-12 px-4">
          <h3 className="text-2xl font-bold mb-8 text-center">
            Who are Waiting for You?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {pets.map((pet, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gray-200"></div> {/* Image placeholder */}
                <div className="p-6">
                  <h4 className="text-xl font-semibold mb-2">{pet.name}</h4>
                  <p className="text-gray-600">{pet.details}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
  
        {/* Footer Sections */}
        <footer className="bg-gray-800 text-white py-12 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-bold mb-4">Contact Us</h4>
              <p className="text-gray-400">Your Fur-ever Friends</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Information</h4>
              <p className="text-gray-400">Friends Related</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Friend Is Waiting!</h4>
              <p className="text-gray-400">Gross Matching</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }
  