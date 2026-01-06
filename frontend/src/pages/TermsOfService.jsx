import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const TermsOfService = () => {
    const currentYear = new Date().getFullYear();

    return (
        <div className="min-h-screen relative">
            {/* Header */}
            <div className="relative pt-32 pb-8">
                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
                    <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
                        <FiArrowLeft size={18} />
                        Back to Home
                    </Link>
                    <h1 className="text-3xl sm:text-4xl font-black text-white">Terms of Service</h1>
                    <p className="text-white/70 mt-2">Last updated: January 2, 2026</p>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-16">
                <div className="bg-white/20 backdrop-blur-xl rounded-3xl border border-white/30 p-6 sm:p-10 space-y-8 shadow-lg">

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                        <p className="text-white/80 leading-relaxed">
                            By accessing or using Collegio ("the Platform"), you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use our services. These terms apply to all users,
                            including students, landlords, property managers, and visitors.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">2. Eligibility</h2>
                        <p className="text-white/80 leading-relaxed mb-3">
                            To use Collegio, you must:
                        </p>
                        <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                            <li>Be at least 18 years of age</li>
                            <li>Have a valid .edu email address (for student accounts) or verifiable business credentials (for landlord accounts)</li>
                            <li>Provide accurate and complete registration information</li>
                            <li>Maintain the security of your account credentials</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">3. User Accounts</h2>
                        <p className="text-white/80 leading-relaxed mb-3">
                            When you create an account, you agree to:
                        </p>
                        <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                            <li>Provide truthful information in your profile and listings</li>
                            <li>Keep your login credentials confidential</li>
                            <li>Notify us immediately of any unauthorized access to your account</li>
                            <li>Accept responsibility for all activities under your account</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">4. Listing and Housing Services</h2>
                        <p className="text-white/80 leading-relaxed mb-3">
                            Collegio provides a platform for connecting students with housing opportunities. We do not:
                        </p>
                        <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                            <li>Own, manage, or control any listed properties</li>
                            <li>Guarantee the accuracy of listing information</li>
                            <li>Act as a real estate broker or agent</li>
                            <li>Mediate disputes between landlords and tenants</li>
                        </ul>
                        <p className="text-white/80 leading-relaxed mt-3">
                            Users are responsible for verifying all property information, conducting their own due diligence,
                            and entering into lease agreements at their own discretion.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">5. Roommate Matching</h2>
                        <p className="text-white/80 leading-relaxed">
                            Our AI-powered roommate matching feature uses lifestyle preferences to suggest compatible roommates.
                            We do not guarantee compatibility or the accuracy of user-provided information. Users should
                            exercise their own judgment when connecting with potential roommates and meet in safe,
                            public places before making housing decisions together.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">6. Student Marketplace</h2>
                        <p className="text-white/80 leading-relaxed mb-3">
                            Collegio provides a marketplace for students to buy and sell items. When using the marketplace:
                        </p>
                        <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                            <li>Sellers are responsible for the accuracy of item descriptions and pricing</li>
                            <li>Buyers and sellers transact directly; Collegio is not a party to sales</li>
                            <li>We recommend meeting in public, well-lit areas for exchanges</li>
                            <li>Collegio does not provide payment processing or buyer/seller protection</li>
                            <li>Prohibited items include: weapons, drugs, alcohol, stolen goods, and counterfeit products</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">7. Messaging and Communication</h2>
                        <p className="text-white/80 leading-relaxed mb-3">
                            When using our messaging system, you agree not to:
                        </p>
                        <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                            <li>Send spam, unsolicited messages, or promotional content</li>
                            <li>Harass, threaten, or discriminate against other users</li>
                            <li>Share illegal or inappropriate content</li>
                            <li>Attempt to conduct transactions outside the platform to avoid safety features</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">7. Prohibited Activities</h2>
                        <p className="text-white/80 leading-relaxed mb-3">Users may not:</p>
                        <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                            <li>Post false, misleading, or fraudulent listings</li>
                            <li>Impersonate others or misrepresent affiliations</li>
                            <li>Violate fair housing laws or discriminate based on protected characteristics</li>
                            <li>Scrape, harvest, or collect user data without authorization</li>
                            <li>Interfere with the platform's operation or security</li>
                            <li>Use the platform for any illegal purposes</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">8. Content Ownership</h2>
                        <p className="text-white/80 leading-relaxed">
                            You retain ownership of content you post (photos, descriptions, etc.) but grant Collegio a
                            non-exclusive, royalty-free license to use, display, and distribute this content on the platform.
                            We may remove content that violates these terms without notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">9. Disclaimer of Warranties</h2>
                        <p className="text-white/80 leading-relaxed">
                            The Platform is provided "as is" without warranties of any kind. We do not warrant that the
                            service will be uninterrupted, error-free, or secure. We are not responsible for the actions
                            of users, the quality of listed properties, or outcomes of roommate matches.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">10. Limitation of Liability</h2>
                        <p className="text-white/80 leading-relaxed">
                            To the maximum extent permitted by law, Collegio shall not be liable for any indirect,
                            incidental, special, consequential, or punitive damages arising from your use of the platform,
                            including but not limited to disputes with landlords, roommates, or property issues.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">11. Account Termination</h2>
                        <p className="text-white/80 leading-relaxed">
                            We reserve the right to suspend or terminate accounts that violate these terms. You may
                            delete your account at any time through your account settings. Upon termination, your
                            right to use the platform ceases immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">12. Changes to Terms</h2>
                        <p className="text-white/80 leading-relaxed">
                            We may update these terms from time to time. Continued use of the platform after changes
                            constitutes acceptance of the new terms. We will notify users of significant changes via
                            email or platform notification.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">13. Contact Information</h2>
                        <p className="text-white/80 leading-relaxed">
                            For questions about these Terms of Service, please contact us at{' '}
                            <a href="mailto:admin@collegio.us" className="text-yellow-200 hover:underline">
                                admin@collegio.us
                            </a>
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
