import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const CookiePolicy = () => {
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
                    <h1 className="text-3xl sm:text-4xl font-black text-white">Cookie Policy</h1>
                    <p className="text-white/70 mt-2">Last updated: December {currentYear}</p>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-16">
                <div className="bg-white/20 backdrop-blur-xl rounded-3xl border border-white/30 p-6 sm:p-10 space-y-8 shadow-lg">

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">1. What Are Cookies?</h2>
                        <p className="text-white/80 leading-relaxed">
                            Cookies are small text files stored on your device (computer, tablet, or mobile) when you
                            visit a website. They help websites remember your preferences, keep you logged in, and
                            understand how you use the site. Collegio uses cookies and similar technologies to provide
                            a better user experience.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">2. Types of Cookies We Use</h2>

                        <div className="space-y-4">
                            <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                                <h3 className="text-lg font-semibold text-green-300 mb-2">Essential Cookies</h3>
                                <p className="text-white/80">
                                    These cookies are necessary for the platform to function properly. They enable core
                                    features like user authentication, session management, and security. Without these,
                                    you cannot use Collegio.
                                </p>
                                <ul className="list-disc list-inside text-white/80 mt-2 ml-4">
                                    <li>Authentication tokens (keeping you logged in)</li>
                                    <li>Session identifiers</li>
                                    <li>Security tokens (CSRF protection)</li>
                                </ul>
                            </div>

                            <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                                <h3 className="text-lg font-semibold text-blue-300 mb-2">Functional Cookies</h3>
                                <p className="text-white/80">
                                    These cookies remember your preferences and settings to provide a personalized experience.
                                </p>
                                <ul className="list-disc list-inside text-white/80 mt-2 ml-4">
                                    <li>Search preferences and filters</li>
                                    <li>Map view settings</li>
                                    <li>Language and region preferences</li>
                                    <li>Theme preferences (if applicable)</li>
                                </ul>
                            </div>

                            <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                                <h3 className="text-lg font-semibold text-purple-300 mb-2">Analytics Cookies</h3>
                                <p className="text-white/80">
                                    These cookies help us understand how users interact with Collegio, which pages are
                                    most popular, and how we can improve the platform.
                                </p>
                                <ul className="list-disc list-inside text-white/80 mt-2 ml-4">
                                    <li>Page views and navigation patterns</li>
                                    <li>Feature usage statistics</li>
                                    <li>Error tracking and performance monitoring</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">3. Third-Party Cookies</h2>
                        <p className="text-white/80 leading-relaxed mb-3">
                            We may use cookies from third-party services that help us operate and improve Collegio:
                        </p>
                        <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                            <li><strong>Mapbox:</strong> For displaying interactive maps and location services</li>
                            <li><strong>Google Fonts:</strong> For loading custom typography</li>
                        </ul>
                        <p className="text-white/80 leading-relaxed mt-3">
                            These third parties may set their own cookies. Please refer to their respective privacy
                            policies for more information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">4. Local Storage</h2>
                        <p className="text-white/80 leading-relaxed">
                            In addition to cookies, we use browser local storage to store certain data locally on
                            your device. This includes:
                        </p>
                        <ul className="list-disc list-inside text-white/80 space-y-2 ml-4 mt-3">
                            <li>Authentication tokens for faster login</li>
                            <li>User preferences and settings</li>
                            <li>Cached data for improved performance</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">5. Cookie Duration</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/10">
                                        <th className="p-3 font-semibold text-white border border-white/20">Cookie Type</th>
                                        <th className="p-3 font-semibold text-white border border-white/20">Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="p-3 text-white/80 border border-white/20">Session Cookies</td>
                                        <td className="p-3 text-white/80 border border-white/20">Deleted when you close your browser</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 text-white/80 border border-white/20">Authentication Token</td>
                                        <td className="p-3 text-white/80 border border-white/20">7 days (or until logout)</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 text-white/80 border border-white/20">Preference Cookies</td>
                                        <td className="p-3 text-white/80 border border-white/20">1 year</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 text-white/80 border border-white/20">Analytics Cookies</td>
                                        <td className="p-3 text-white/80 border border-white/20">Up to 2 years</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">6. Managing Cookies</h2>
                        <p className="text-white/80 leading-relaxed mb-3">
                            You can control and manage cookies in several ways:
                        </p>
                        <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                            <li><strong>Browser Settings:</strong> Most browsers allow you to block or delete cookies through settings</li>
                            <li><strong>Private/Incognito Mode:</strong> Use private browsing to prevent cookies from being stored</li>
                            <li><strong>Clear Cookies:</strong> Delete existing cookies through your browser settings</li>
                        </ul>
                        <div className="mt-4 p-4 bg-yellow-500/20 rounded-xl border border-yellow-400/30">
                            <p className="text-yellow-200">
                                <strong>Note:</strong> Blocking essential cookies will prevent you from logging in and
                                using core features of Collegio.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">7. Browser-Specific Instructions</h2>
                        <p className="text-white/80 leading-relaxed mb-3">
                            To manage cookies in your browser:
                        </p>
                        <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                            <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                            <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                            <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                            <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">8. Changes to This Policy</h2>
                        <p className="text-white/80 leading-relaxed">
                            We may update this Cookie Policy from time to time to reflect changes in our practices
                            or for legal reasons. We will post the updated policy on this page with a new "Last Updated"
                            date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">9. Contact Us</h2>
                        <p className="text-white/80 leading-relaxed">
                            If you have questions about our use of cookies, please contact us at{' '}
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

export default CookiePolicy;
