import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCheck, FiClock, FiVolume2, FiThermometer, FiUsers, FiAlertCircle } from 'react-icons/fi';
import ModernBackground from '../components/shared/ModernBackground';
import lifestyleProfileService from '../services/lifestyleProfileService';

const CompatibilityTest = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [answers, setAnswers] = useState({});

    const scenarios = [
        {
            id: 'weeknight',
            icon: FiClock,
            question: "It's 11 PM on a Tuesday. What are you usually doing?",
            options: [
                { value: 'sleeping', label: "😴 Fast asleep", score: { noise: 1, social: 1 } },
                { value: 'quiet', label: "📖 Reading/Chilling quietly", score: { noise: 3, social: 2 } },
                { value: 'gaming', label: "🎮 Gaming/Watching TV", score: { noise: 6, social: 4 } },
                { value: 'out', label: "🍻 Out with friends", score: { noise: 8, social: 9 } }
            ]
        },
        {
            id: 'dishes',
            icon: FiAlertCircle,
            question: "The sink is full of dishes. What's your reaction?",
            options: [
                { value: 'immediate', label: "🧼 Wash them immediately (even if not mine)", score: { clean: 10 } },
                { value: 'own', label: "🍽️ Wash mine, leave the rest", score: { clean: 7 } },
                { value: 'later', label: "⏳ Leave them for the morning", score: { clean: 4 } },
                { value: 'pile', label: "🏔️ Add to the pile until we run out", score: { clean: 1 } }
            ]
        },
        {
            id: 'guests',
            icon: FiUsers,
            question: "A roommate asks if their partner can stay over for the weekend...",
            options: [
                { value: 'no', label: "🚫 No, I prefer no guests", score: { guests: 1 } },
                { value: 'ask', label: "💬 Sure, but ask every time", score: { guests: 5 } },
                { value: 'chill', label: "🤙 Yeah, whatever", score: { guests: 8 } },
                { value: 'join', label: "🎉 The more the merrier!", score: { guests: 10 } }
            ]
        },
        {
            id: 'thermostat',
            icon: FiThermometer,
            question: "What's the ideal thermostat setting?",
            options: [
                { value: 'cold', label: "❄️ 68°F or lower (Sweater weather)", score: { temp: 'cold' } },
                { value: 'moderate', label: "🌡️ 70-72°F (Just right)", score: { temp: 'moderate' } },
                { value: 'warm', label: "🔥 74°F or higher (Tropical)", score: { temp: 'warm' } }
            ]
        },
        {
            id: 'conflict',
            icon: FiVolume2,
            question: "Your roommate is playing music too loud. You...",
            options: [
                { value: 'text', label: "📱 Text them to turn it down", score: { conflict: 'passive' } },
                { value: 'knock', label: "🚪 Knock and ask politely", score: { conflict: 'direct' } },
                { value: 'headphones', label: "🎧 Put on noise cancelling headphones", score: { conflict: 'avoidant' } },
                { value: 'revenge', label: "🔊 Play my music louder", score: { conflict: 'aggressive' } }
            ]
        }
    ];

    const handleAnswer = (option) => {
        const currentScenario = scenarios[step];
        const newAnswers = {
            ...answers,
            [currentScenario.id]: option.value,
            [`${currentScenario.id}_score`]: option.score
        };

        setAnswers(newAnswers);

        if (step < scenarios.length - 1) {
            setStep(step + 1);
        } else {
            finishTest(newAnswers);
        }
    };

    const finishTest = async (finalAnswers) => {
        setLoading(true);
        try {
            // In a real app, we'd process these scores into a compatibility vector
            // For now, we'll save the raw answers to the profile
            await lifestyleProfileService.updateCompatibility(finalAnswers);
            navigate('/profile');
        } catch (error) {
            console.error('Error saving compatibility test:', error);
            // Navigate anyway for now
            navigate('/profile');
        } finally {
            setLoading(false);
        }
    };

    const currentScenario = scenarios[step];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="relative h-48 overflow-hidden">
                <ModernBackground />
                <div className="absolute inset-0 flex items-center justify-center">
                    <h1 className="text-3xl font-black text-white">Compatibility Test</h1>
                </div>
            </div>

            <div className="flex-1 -mt-12 px-4 pb-12 relative z-10">
                <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl p-8 min-h-[400px] flex flex-col">
                    {/* Progress */}
                    <div className="w-full bg-gray-100 h-2 rounded-full mb-8">
                        <div
                            className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${((step + 1) / scenarios.length) * 100}%` }}
                        />
                    </div>

                    {/* Question */}
                    <div className="flex-1 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 text-3xl">
                            <currentScenario.icon />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-8">
                            {currentScenario.question}
                        </h2>

                        <div className="w-full space-y-3">
                            {currentScenario.options.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleAnswer(option)}
                                    className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-orange-500 hover:bg-orange-50 transition-all text-left flex items-center gap-3 group"
                                >
                                    <span className="font-bold text-gray-700 group-hover:text-orange-700">{option.label}</span>
                                    <FiArrowRight className="ml-auto opacity-0 group-hover:opacity-100 text-orange-500 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompatibilityTest;
