import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const PrivacyPolicy = () => {
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
                    <h1 className="text-3xl sm:text-4xl font-black text-white">Privacy Policy</h1>
                    <p className="text-white/70 mt-2">Last updated: January 2, 2026</p>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-16">
                <div className="bg-white/20 backdrop-blur-xl rounded-3xl border border-white/30 p-6 sm:p-10 space-y-8 shadow-lg">

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">1. Introduction</h2>
                        <p className="text-white/80 leading-relaxed">
                            Collegio ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
                            explains how we collect, use, disclose, and safeguard your information when you use our
                            student housing platform. Please read this policy carefully to understand our practices
                            regarding your personal data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">2. Information We Collect</h2>

                        <h3 className="text-lg font-semibold text-white/90 mb-3 mt-4">2.1 Information You Provide</h3>
                        <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                            <li><strong>Account Information:</strong> Name, email address (.edu or business email), phone number, password</li>
                            <li><strong>Profile Information:</strong> Profile photo, age, university/college, major, graduation year</li>
                            <li><strong>Lifestyle Preferences:</strong> Sleep schedule, cleanliness habits, noise preferences, guest policies, study habits for roommate matching</li>
                            <li><strong>Listing Information:</strong> Property photos, addresses, descriptions, pricing, amenities (for landlords)</li>
                            <li><strong>Marketplace Information:</strong> Item photos, descriptions, pricing (for sellers in student marketplace)</li>
                            <li><strong>Communications:</strong> Messages sent through our platform, support inquiries</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-white/90 mb-3 mt-4">2.2 Automatically Collected Information</h3>
                        <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                            <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
                            <li><strong>Usage Data:</strong> Pages visited, features used, search queries, listings viewed</li>
                            <li><strong>Location Data:</strong> General location based on IP address for relevant search results</li>
                            <li><strong>Cookies:</strong> See our Cookie Policy for details</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">3. How We Use Your Information</h2>
                        <p className="text-white/80 leading-relaxed mb-3">We use collected information to:</p>
                        <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                            <li>Create and manage your account</li>
                            <li>Provide roommate matching based on lifestyle compatibility</li>
                            <li>Display relevant housing listings in your search area</li>
                            <li>Facilitate messaging between users</li>
                            <li>Send email notifications about messages, applications, and account activity</li>
                            <li>Verify user identities through .edu email validation</li>
                            <li>Improve our platform and develop new features</li>
                            <li>Detect and prevent fraud, abuse, and security issues</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">4. Information Sharing</h2>
                        <p className="text-white/80 leading-relaxed mb-3">We may share your information with:</p>
                        <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                            <li><strong>Other Users:</strong> Your profile information is visible to other users for roommate matching and messaging purposes</li>
                            <li><strong>Landlords:</strong> When you apply for a listing, landlords receive your contact information and application details</li>
                            <li><strong>Service Providers:</strong> Third parties who help us operate the platform (hosting, email, analytics)</li>
                            <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental authority</li>
                            <li><strong>Safety:</strong> To protect the safety and security of users or the public</li>
                        </ul>
                        <p className="text-white/80 leading-relaxed mt-3">
                            <strong>We do not sell your personal information to third parties.</strong>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">5. Data Security</h2>
                        <p className="text-white/80 leading-relaxed">
                            We implement industry-standard security measures to protect your data, including:
                        </p>
                        <ul className="list-disc list-inside text-white/80 space-y-2 ml-4 mt-3">
                            <li>Encrypted data transmission (HTTPS/TLS)</li>
                            <li>Secure password hashing</li>
                            <li>Regular security audits</li>
                            <li>Access controls and authentication</li>
                        </ul>
                        <p className="text-white/80 leading-relaxed mt-3">
                            However, no method of transmission over the internet is 100% secure. We cannot guarantee
                            absolute security of your data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">6. Your Rights and Choices</h2>
                        <p className="text-white/80 leading-relaxed mb-3">You have the right to:</p>
                        <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                            <li><strong>Access:</strong> Request a copy of your personal data</li>
                            <li><strong>Correction:</strong> Update inaccurate information in your profile</li>
                            <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                            <li><strong>Opt-out:</strong> Unsubscribe from marketing emails via email settings</li>
                            <li><strong>Data Portability:</strong> Request your data in a portable format</li>
                        </ul>
                        <p className="text-white/80 leading-relaxed mt-3">
                            To exercise these rights, please contact us at{' '}
                            <a href="mailto:admin@collegio.us" className="text-yellow-200 hover:underline">
                                admin@collegio.us
                            </a>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">7. Data Retention</h2>
                        <p className="text-white/80 leading-relaxed">
                            We retain your personal data for as long as your account is active or as needed to provide
                            services. After account deletion, we may retain certain information for legal, security,
                            or business purposes for up to 90 days. Anonymized data may be retained indefinitely for
                            analytics purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">8. Third-Party Services</h2>
                        <p className="text-white/80 leading-relaxed">
                            Our platform may contain links to third-party websites or integrate with external services
                            (such as Mapbox for maps). These services have their own privacy policies, and we are not
                            responsible for their practices. We encourage you to review their policies before providing
                            any personal information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">9. Children's Privacy</h2>
                        <p className="text-white/80 leading-relaxed">
                            Collegio is not intended for users under 18 years of age. We do not knowingly collect
                            personal information from children. If we learn that we have collected data from a child
                            under 18, we will delete that information promptly.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">10. International Users</h2>
                        <p className="text-white/80 leading-relaxed">
                            Collegio is primarily designed for users in the United States. If you access the platform
                            from outside the U.S., your information may be transferred to and processed in the United
                            States, where data protection laws may differ from your country.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">11. Changes to This Policy</h2>
                        <p className="text-white/80 leading-relaxed">
                            We may update this Privacy Policy periodically. We will notify you of significant changes
                            via email or platform notification. Your continued use of Collegio after changes indicates
                            acceptance of the updated policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">12. Contact Us</h2>
                        <p className="text-white/80 leading-relaxed">
                            For questions or concerns about this Privacy Policy or our data practices, please contact:
                        </p>
                        <div className="mt-4 p-4 bg-white/10 rounded-xl border border-white/20">
                            <p className="text-white font-semibold">Collegio Privacy Team</p>
                            <p className="text-white/80">
                                Email:{' '}
                                <a href="mailto:admin@collegio.us" className="text-yellow-200 hover:underline">
                                    admin@collegio.us
                                </a>
                            </p>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
