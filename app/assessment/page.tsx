"use client";
import { useState, useEffect } from "react";
import Header from '@/components/header';
import Footer from '@/components/Footer';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  age_group?: string;
  profile_pic?: string;
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

export default function AssessmentPage() {
  const [answers, setAnswers] = useState<Record<number, string | number | null>>({});
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentStatusCount, setAppointmentStatusCount] = useState({
    pending: 0,
    approved: 0,
    declined: 0,
    total: 0
  });
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  const questions = [
    {
      id: 1,
      question: "How active is your daily lifestyle?",
      type: "scale",
      options: [1, 2, 3, 4, 5],
      labels: ["Very Low", "Low", "Moderate", "High", "Very High"]
    },
    {
      id: 2,
      question: "How much time can you spend with a pet daily?",
      type: "scale",
      options: [1, 2, 3, 4, 5],
      labels: ["Very Little", "Little", "Moderate", "A Lot", "Most of the Day"]
    },
    {
      id: 3,
      question: "How much space do you have at home?",
      type: "categorical",
      options: ["Small", "Medium", "Large"]
    },
    {
      id: 4,
      question: "How much grooming time can you commit?",
      type: "scale",
      options: [1, 2, 3, 4, 5],
      labels: ["Minimal", "Little", "Moderate", "Regular", "Extensive"]
    },
    {
      id: 5,
      question: "How do you feel about pet noise levels?",
      type: "scale",
      options: [1, 2, 3, 4, 5],
      labels: ["Very Quiet", "Quiet", "Moderate", "Somewhat Loud", "Very Loud"]
    },
    {
      id: 6,
      question: "How important is pet independence?",
      type: "scale",
      options: [1, 2, 3, 4, 5],
      labels: ["Very Dependent", "Dependent", "Moderate", "Independent", "Very Independent"]
    },
    {
      id: 7,
      question: "How do you feel about pet shedding?",
      type: "scale",
      options: [1, 2, 3, 4, 5],
      labels: ["Minimal", "Light", "Moderate", "Heavy", "Very Heavy"]
    },
    {
      id: 8,
      question: "How much exercise can you provide?",
      type: "scale",
      options: [1, 2, 3, 4, 5],
      labels: ["Minimal", "Light", "Moderate", "Regular", "Intensive"]
    },
    {
      id: 9,
      question: "How do you feel about pet training needs?",
      type: "scale",
      options: [1, 2, 3, 4, 5],
      labels: ["Minimal", "Basic", "Moderate", "Advanced", "Professional"]
    },
    {
      id: 10,
      question: "How important is pet friendliness with strangers?",
      type: "scale",
      options: [1, 2, 3, 4, 5],
      labels: ["Reserved", "Cautious", "Moderate", "Friendly", "Very Friendly"]
    },
    {
      id: 11,
      question: "How do you feel about pet energy levels?",
      type: "scale",
      options: [1, 2, 3, 4, 5],
      labels: ["Very Low", "Low", "Moderate", "High", "Very High"]
    },
    {
      id: 12,
      question: "How much time do you spend away from home?",
      type: "scale",
      options: [1, 2, 3, 4, 5],
      labels: ["Rarely", "Occasionally", "Moderate", "Often", "Very Often"]
    },
    {
      id: 13,
      question: "How do you feel about pet size?",
      type: "categorical",
      options: ["Small", "Medium", "Large"]
    },
    {
      id: 14,
      question: "How important is pet adaptability to different environments?",
      type: "scale",
      options: [1, 2, 3, 4, 5],
      labels: ["Not Important", "Somewhat", "Moderate", "Important", "Very Important"]
    },
    {
      id: 15,
      question: "How do you feel about pet vocalization?",
      type: "scale",
      options: [1, 2, 3, 4, 5],
      labels: ["Very Quiet", "Quiet", "Moderate", "Vocal", "Very Vocal"]
    }
  ];

  useEffect(() => {
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

  const handleAnswerSelect = (questionId: number, answer: string | number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const isAllAnswered = Object.keys(answers).length === questions.length;

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setLoggedInUser(null);
    setAppointments([]);
    setAppointmentStatusCount({ pending: 0, approved: 0, declined: 0, total: 0 });
  };

  const handleSubmit = async () => {
    if (!isAllAnswered) return;

    // 🔹 check if user is logged in
    if (!loggedInUser) {
      alert("You must log in first before taking the assessment.");
      return; // stop execution, huwag tumuloy sa fetch
    }

    setIsSubmitting(true);

    try {
      // Map question answers to backend field names
      const assessmentData = {
        name: `${loggedInUser.first_name} ${loggedInUser.last_name}`,
        contact_info: loggedInUser.email,
        email: loggedInUser.email,
        answer_activity_level: answers[1] as number,
        answer_attention_needs: answers[2] as number,
        answer_space_requirement: answers[3],
        answer_grooming_needs: answers[4] as number,
        answer_noise_level: answers[5] as number,
        answer_independence_level: answers[6] as number,
        answer_shedding_level: answers[7] as number,
        answer_exercise_requirements: answers[8] as number,
        answer_training_needs: answers[9] as number,
        answer_friendliness_with_strangers: answers[10] as number,
        answer_energy_level: answers[11] as number,
        answer_separation_anxiety_tendency: answers[12] as number,
        answer_adaptability: answers[14] as number,
        answer_vocalization_level: answers[15] as number,
      };

      console.log("Submitting assessment payload:", assessmentData);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/matching/adopters/submit-assessment/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(assessmentData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        // Store adopter ID for matching
        localStorage.setItem("adopter_id", result.adopter.id);
        // Redirect to matches page
        window.location.href = "/matches";
      } else {
        alert("❌ Error submitting assessment.");
        console.error("Error submitting assessment");
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      alert("⚠️ Server error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
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

      {/* Assessment Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-myOrage mb-2">
              Find your Fur-fect Match
            </h1>
            <p className="text-myOrage">
              Answer these 15 questions to help us find a pet that perfectly fits your lifestyle and personality!
            </p>
            <div className="mt-4 text-sm text-gray-600">
              Progress: {Object.keys(answers).length} / {questions.length} questions answered
            </div>
          </div>

          {/* All Questions */}
          <div className="space-y-8">
            {questions.map((q) => (
              <div key={q.id} className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-myOrage text-center">
                  {q.id}. {q.question}
                </h2>
                
                <div className="grid grid-cols-1 gap-3 px-8">
                  {q.type === 'scale' ? (
                    // Scale questions (1-5)
                    <div className="grid grid-cols-5 gap-2">
                      {q.options.map((option, index) => (
                        <button
                          key={option}
                          className={`p-3 rounded-lg transition-all text-center text-sm ${
                            answers[q.id] === option 
                              ? 'bg-myOrage text-white font-medium' 
                              : 'bg-myPink text-myOrage hover:bg-pink-100'
                          }`}
                          onClick={() => handleAnswerSelect(q.id, option)}
                        >
                          <div className="font-bold">{option}</div>
                          <div className="text-xs mt-1">{q.labels![index]}</div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    // Categorical questions
                    <div className="grid grid-cols-3 gap-3">
                      {q.options.map((option) => (
                        <button
                          key={option}
                          className={`p-4 rounded-lg transition-all text-center text-lg ${
                            answers[q.id] === option 
                              ? 'bg-myOrage text-white font-medium' 
                              : 'bg-myPink text-myOrage hover:bg-pink-100'
                          }`}
                          onClick={() => handleAnswerSelect(q.id, option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-12">
            <button
              onClick={handleSubmit}
              disabled={!isAllAnswered || isSubmitting}
              className={`px-20 py-3 rounded-full flex items-center text-lg ${
                !isAllAnswered || isSubmitting
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-myOrage text-white hover:bg-orange-600'
              }`}
            >
              {isSubmitting ? 'Finding Matches...' : 'Find My Perfect Match'}
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}