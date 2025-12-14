"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

interface PetFormData {
  id: number;
  name: string;
  breed: string;
  age: string;
  gender: string;
  size: string;
  color: string;
  healthCondition: string;
  story: string;
  status: "Available" | "In Trial" | "Adopted";
  type: "dog" | "cat";
  vaccinated: boolean;
  image: File | null;
  previewImage: string;
  // C4.5 Decision Tree Traits
  activity_level: number;
  attention_needs: number;
  space_requirement: string;
  grooming_needs: number;
  noise_level: number;
  independence_level: number;
  shedding_level: number;
  exercise_requirements: number;
  training_needs: number;
  friendliness_with_strangers: number;
  energy_level: number;
  separation_anxiety_tendency: number;
  adaptability: number;
  vocalization_level: number;
}

// Create a separate component that uses useSearchParams
function AddPetContent() {
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  const petId = searchParams.get('id');
  
  const [activeTab, setActiveTab] = useState('Pets');
  const [petData, setPetData] = useState<PetFormData>({
    id: 0,
    name: '',
    breed: '',
    age: '',
    gender: '',
    size: '',
    color: '',
    healthCondition: '',
    story: '',
    status: 'Available',
    type: 'dog',
    vaccinated: false,
    image: null,
    previewImage: '',
    // C4.5 Decision Tree Traits - Default values
    activity_level: 3,
    attention_needs: 3,
    space_requirement: 'Medium',
    grooming_needs: 3,
    noise_level: 3,
    independence_level: 3,
    shedding_level: 3,
    exercise_requirements: 3,
    training_needs: 3,
    friendliness_with_strangers: 3,
    energy_level: 3,
    separation_anxiety_tendency: 3,
    adaptability: 3,
    vocalization_level: 3,
  });

  useEffect(() => {
  if (isEditMode && petId) {
    const fetchPetData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pets/${petId}/`);
        const petFromApi = await response.json();

        // Kung array ang response, kunin first element
        const pet = Array.isArray(petFromApi) ? petFromApi[0] : petFromApi;

        setPetData({
          id: pet.id,
          name: pet.name ?? '',
          breed: pet.breed ?? '',
          age: pet.age ?? '',
          gender: pet.gender ?? '',
          size: pet.size ?? '',
          color: pet.color ?? '',
          healthCondition: pet.health_condition ?? '',
          story: pet.story ?? '',
          status: pet.status ?? 'Available',
          type: pet.type ?? 'dog',
          vaccinated: pet.vaccinated ?? false,
          image: null,
          previewImage: pet.image ?? '',
            // C4.5 Decision Tree Traits
            activity_level: pet.activity_level || 3,
            attention_needs: pet.attention_needs || 3,
            space_requirement: pet.space_requirement || 'Medium',
            grooming_needs: pet.grooming_needs || 3,
            noise_level: pet.noise_level || 3,
            independence_level: pet.independence_level || 3,
            shedding_level: pet.shedding_level || 3,
            exercise_requirements: pet.exercise_requirements || 3,
            training_needs: pet.training_needs || 3,
            friendliness_with_strangers: pet.friendliness_with_strangers || 3,
            energy_level: pet.energy_level || 3,
            separation_anxiety_tendency: pet.separation_anxiety_tendency || 3,
            adaptability: pet.adaptability || 3,
            vocalization_level: pet.vocalization_level || 3,
          });
        } catch (error) {
          console.error('Error fetching pet data:', error);
        }
      };
      fetchPetData();
    }
  }, [isEditMode, petId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setPetData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setPetData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setPetData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPetData(prev => ({
        ...prev,
        image: file,
        previewImage: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('admin_token');
    const formData = new FormData();

    // Debug: Log all form data before sending
    console.log('Pet Data to be sent:', petData);

    // Append basic information
    formData.append('name', petData.name);
    formData.append('breed', petData.breed);
    formData.append('age', petData.age);
    formData.append('gender', petData.gender);
    formData.append('size', petData.size);
    formData.append('color', petData.color);
    formData.append('health_condition', petData.healthCondition);
    formData.append('story', petData.story);
    formData.append('status', petData.status);
    formData.append('type', petData.type);
    formData.append('vaccinated', petData.vaccinated.toString());

    // Append C4.5 traits - ensure they're numbers
    formData.append('activity_level', String(petData.activity_level));
    formData.append('attention_needs', String(petData.attention_needs));
    formData.append('space_requirement', petData.space_requirement);
    formData.append('grooming_needs', String(petData.grooming_needs));
    formData.append('noise_level', String(petData.noise_level));
    formData.append('independence_level', String(petData.independence_level));
    formData.append('shedding_level', String(petData.shedding_level));
    formData.append('exercise_requirements', String(petData.exercise_requirements));
    formData.append('training_needs', String(petData.training_needs));
    formData.append('friendliness_with_strangers', String(petData.friendliness_with_strangers));
    formData.append('energy_level', String(petData.energy_level));
    formData.append('separation_anxiety_tendency', String(petData.separation_anxiety_tendency));
    formData.append('adaptability', String(petData.adaptability));
    formData.append('vocalization_level', String(petData.vocalization_level));

    // Append image file if it exists
    if (petData.image) {
      formData.append('image', petData.image);
      console.log('Image file appended:', petData.image.name);
    } else {
      console.log('No image file to append');
    }

    // Debug: Log all form data entries
    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const url = isEditMode 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/pets/${petId}/`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/pets/`;

    const method = isEditMode ? 'PUT' : 'POST';

    console.log('Sending request to:', url);
    console.log('Method:', method);

    const response = await fetch(url, {
      method: method,
      headers: { 
        'Authorization': token ? `Token ${token}` : '',
      },
      body: formData,
    });

    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response (text):', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
        console.error('Server error response (JSON):', errorData);
      } catch {
        console.error('Could not parse error response as JSON');
      }
      
      throw new Error(errorData?.detail || errorData?.message || `Server error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Pet saved successfully:', result);
    
    // Redirect to pets list
    window.location.href = '/admin/pets';
  } catch (error: unknown) {
    let errorMessage = 'Failed to save pet. Please try again.';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message);
    }
    
    console.error('Error submitting pet data:', error);
    alert(`Error: ${errorMessage}`);
  }
};

  const renderTraitField = (fieldName: keyof PetFormData, label: string, min: number = 1, max: number = 5) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} ({min}-{max})
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            name={fieldName}
            min={min}
            max={max}
            value={petData[fieldName] as number}
            onChange={handleInputChange}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-lg font-semibold text-myOrage min-w-[2rem] text-center">
            {String(petData[fieldName])}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-myOrage shadow-md">
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

      <div className="flex-1 overflow-auto">
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
              <span className="mr-2 text-gray-700">Admin 1</span>
              <button
                onClick={() => {
                  localStorage.removeItem('admin_token');
                  localStorage.removeItem('admin_user_role');
                  localStorage.removeItem('admin_is_staff');
                  window.location.href = '/admin/login';
                }}
                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors mr-2"
              >
                Logout
              </button>
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium"></span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-myOrage mb-6">
              {isEditMode ? 'Edit Pet Profile' : 'Pet Profile'}
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/3 space-y-4">
                  <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                    {petData.previewImage ? (
                      <Image
                        src={petData.previewImage} 
                        alt="Pet preview" 
                        width={500}
                        height={500}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500">No image selected</span>
                    )}
                  </div>
                  <label className="block">
                    <span className="sr-only">Choose pet photo</span>
                    <input 
                      type="file" 
                      onChange={handleImageChange}
                      accept="image/*"
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-myPink file:text-myOrage
                        hover:file:bg-myPink-dark"
                    />
                  </label>
                  <p className="text-sm text-gray-500">Upload an image of the pet</p>
                </div>

                <div className="w-full md:w-2/3 space-y-4">
                  <h2 className="text-2xl font-semibold text-myOrage border-b pb-2">About</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={petData.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-myOrage focus:border-myOrage"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Breed</label>
                      <input
                        type="text"
                        name="breed"
                        value={petData.breed}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-myOrage focus:border-myOrage"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Age</label>
                      <input
                        type="text"
                        name="age"
                        value={petData.age}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-myOrage focus:border-myOrage"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gender</label>
                      <select
                        name="gender"
                        value={petData.gender}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-myOrage focus:border-myOrage"
                        required
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Size</label>
                      <select
                        name="size"
                        value={petData.size}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-myOrage focus:border-myOrage"
                        required
                      >
                        <option value="">Select size</option>
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Color/Markings</label>
                      <input
                        type="text"
                        name="color"
                        value={petData.color}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-myOrage focus:border-myOrage"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-myOrage border-b pb-2">Status</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      name="type"
                      value={petData.type}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-myOrage focus:border-myOrage"
                      required
                    >
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      name="status"
                      value={petData.status}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-myOrage focus:border-myOrage"
                      required
                    >
                      <option value="Available">Available</option>
                      <option value="In Trial">In Trial</option>
                      <option value="Adopted">Adopted</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-myOrage border-b pb-2">Medical Info</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Health Condition</label>
                  <input
                    type="text"
                    name="healthCondition"
                    value={petData.healthCondition}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-myOrage focus:border-myOrage"
                    required
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="vaccinated"
                    checked={petData.vaccinated}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-myOrage focus:ring-myOrage border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">Vaccinated</label>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-myOrage border-b pb-2">C4.5 Decision Tree Traits</h2>
                <p className="text-sm text-gray-600 mb-4">
                  These traits are used for the pet matching algorithm. Rate each trait on a scale of 1-5.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderTraitField('activity_level', 'Activity Level')}
                  {renderTraitField('attention_needs', 'Attention Needs')}
                  {renderTraitField('grooming_needs', 'Grooming Needs')}
                  {renderTraitField('noise_level', 'Noise Level')}
                  {renderTraitField('independence_level', 'Independence Level')}
                  {renderTraitField('shedding_level', 'Shedding Level')}
                  {renderTraitField('exercise_requirements', 'Exercise Requirements')}
                  {renderTraitField('training_needs', 'Training Needs')}
                  {renderTraitField('friendliness_with_strangers', 'Friendliness with Strangers')}
                  {renderTraitField('energy_level', 'Energy Level')}
                  {renderTraitField('separation_anxiety_tendency', 'Separation Anxiety Tendency')}
                  {renderTraitField('adaptability', 'Adaptability')}
                  {renderTraitField('vocalization_level', 'Vocalization Level')}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Space Requirement</label>
                    <select
                      name="space_requirement"
                      value={petData.space_requirement}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-myOrage focus:border-myOrage"
                      required
                    >
                      <option value="Small">Small</option>
                      <option value="Medium">Medium</option>
                      <option value="Large">Large</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-myOrage border-b pb-2">Story</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tell the pets story</label>
                  <textarea
                    name="story"
                    value={petData.story}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-myOrage focus:border-myOrage"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/admin/pets">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-myOrage"
                  >
                    Cancel
                  </button>
                </Link>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-myOrage hover:bg-myOrage-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-myOrage"
                >
                  {isEditMode ? 'Update Pet' : 'Add Pet'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
const AddPetPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-myOrage text-xl">Loading admin panel...</div>
      </div>
    }>
      <AddPetContent />
    </Suspense>
  );
};

export default AddPetPage;