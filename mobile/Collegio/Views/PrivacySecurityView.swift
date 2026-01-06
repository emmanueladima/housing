import SwiftUI

struct PrivacySecurityView: View {
    var body: some View {
        ZStack {
            GradientBackground()
            
            ScrollView {
                VStack(spacing: 20) {
                    // Terms of Service
                    NavigationLink(destination: TermsOfServiceView()) {
                        legalRow(
                            icon: "doc.text.fill",
                            title: "Terms of Service",
                            lastUpdated: "January 2, 2026"
                        )
                    }
                    .buttonStyle(.plain)
                    
                    // Privacy Policy
                    NavigationLink(destination: PrivacyPolicyView()) {
                        legalRow(
                            icon: "hand.raised.fill",
                            title: "Privacy Policy",
                            lastUpdated: "January 2, 2026"
                        )
                    }
                    .buttonStyle(.plain)
                    
                    // Legal Information
                    NavigationLink(destination: LegalInfoView()) {
                        legalRow(
                            icon: "building.columns.fill",
                            title: "Legal Information",
                            lastUpdated: "January 2, 2026"
                        )
                    }
                    .buttonStyle(.plain)
                }
                .padding()
                .padding(.bottom, 100)
            }
        }
        .navigationTitle("Privacy & Security")
        .navigationBarTitleDisplayMode(.inline)
    }
    
    private func legalRow(icon: String, title: String, lastUpdated: String) -> some View {
        HStack {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(Color.collegioOrange)
                .frame(width: 40)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                    .foregroundStyle(.primary)
                Text("Last updated: \(lastUpdated)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding()
        .glassCard()
    }
}

// MARK: - Terms of Service View
struct TermsOfServiceView: View {
    var body: some View {
        ZStack {
            GradientBackground()
            
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    Group {
                        Text("1. Acceptance of Terms")
                            .font(.headline)
                        Text("By accessing and using Collegio (\"the App\" or \"Service\"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.")
                            .foregroundStyle(.secondary)
                    }
                    
                    Group {
                        Text("2. Description of Service")
                            .font(.headline)
                        Text("""
Collegio is a comprehensive student platform that provides:

• Housing Marketplace: Browse and list rental properties, apartments, and housing options
• Roommate Matching: Find compatible roommates based on lifestyle preferences
• Student Marketplace: Buy and sell items within your campus community
• Community Features: Connect with fellow students through posts, messages, and groups

We provide a marketplace for these services but do not own, manage, or control any properties or items listed on the platform.
""")
                            .foregroundStyle(.secondary)
                    }
                    
                    Group {
                        Text("3. User Accounts")
                            .font(.headline)
                        Text("""
• You must provide accurate information when creating an account
• You are responsible for maintaining the security of your account
• You must be at least 18 years old to use this service
• We reserve the right to suspend or terminate accounts that violate our policies
""")
                            .foregroundStyle(.secondary)
                    }
                    
                    Group {
                        Text("4. User Conduct")
                            .font(.headline)
                        Text("""
You agree not to:
• Post false, misleading, or fraudulent information
• Harass, abuse, threaten, or harm others
• Use the service for illegal purposes
• Attempt to access other users' accounts
• Scrape, collect, or harvest data without permission
• Post stolen, counterfeit, or prohibited items
• Engage in price manipulation or fraudulent transactions
""")
                            .foregroundStyle(.secondary)
                    }
                    
                    Group {
                        Text("5. Housing Listings & Transactions")
                            .font(.headline)
                        Text("""
• Landlords are responsible for the accuracy of their listings
• Collegio does not guarantee the quality, legality, or availability of any listing
• All rental transactions are between users; Collegio is not a party to rental agreements
• Users should conduct their own due diligence before signing any lease
• We recommend meeting landlords in person and viewing properties before making payments
""")
                            .foregroundStyle(.secondary)
                    }
                    
                    Group {
                        Text("6. Marketplace Transactions")
                            .font(.headline)
                        Text("""
• Sellers are responsible for the accuracy of item descriptions and pricing
• Buyers and sellers transact directly; Collegio is not a party to sales
• We recommend meeting in public, well-lit areas for exchanges
• Collegio does not provide payment processing or buyer/seller protection
• Prohibited items include: weapons, drugs, alcohol, stolen goods, and counterfeit products
""")
                            .foregroundStyle(.secondary)
                    }
                    
                    Group {
                        Text("7. Roommate Matching")
                            .font(.headline)
                        Text("""
• Compatibility scores are based on user-provided preferences and are not guarantees
• Users should conduct background checks and meet potential roommates in safe environments
• Collegio is not responsible for roommate disputes or issues arising from matches
""")
                            .foregroundStyle(.secondary)
                    }
                    
                    Group {
                        Text("8. Limitation of Liability")
                            .font(.headline)
                        Text("Collegio is provided \"as is\" without warranties of any kind. We are not liable for issues with housing, roommates, or marketplace transactions, financial losses, accuracy of user-provided information, or actions of other users.")
                            .foregroundStyle(.secondary)
                    }
                    
                    Group {
                        Text("9. Changes to Terms")
                            .font(.headline)
                        Text("We may update these terms at any time. Continued use of the App after changes constitutes acceptance of the new terms.")
                            .foregroundStyle(.secondary)
                    }
                    
                    Group {
                        Text("Contact")
                            .font(.headline)
                        Text("For questions about these terms, contact us at admin@collegio.us")
                            .foregroundStyle(.secondary)
                    }
                    
                    Text("Last updated: January 2, 2026")
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                }
                .padding()
                .padding(.bottom, 100)
            }
        }
        .navigationTitle("Terms of Service")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Privacy Policy View
struct PrivacyPolicyView: View {
    var body: some View {
        ZStack {
            GradientBackground()
            
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    Group {
                        Text("Information We Collect")
                            .font(.headline)
                        Text("""
Account Information:
• Name, email address, and profile photo
• University affiliation and graduation year
• Phone number (optional)

Profile & Preferences:
• Housing preferences (location, budget, move-in date)
• Lifestyle profile for roommate matching
• Marketplace seller information

Usage Data:
• How you interact with the App
• Search history and saved items
• Communication with other users

Device Information:
• Device type and operating system
• App version and crash reports
• IP address and general location
""")
                            .foregroundStyle(.secondary)
                    }
                    
                    Group {
                        Text("How We Use Your Information")
                            .font(.headline)
                        Text("""
• Provide Services: Display listings, match roommates, enable marketplace transactions
• Improve the App: Analyze usage patterns and fix bugs
• Communication: Send notifications about messages, matches, and saved items
• Safety & Security: Prevent fraud and enforce our Terms of Service
• Personalization: Show relevant listings and recommendations
""")
                            .foregroundStyle(.secondary)
                    }
                    
                    Group {
                        Text("Information Sharing")
                            .font(.headline)
                        Text("""
We may share your information:
• With Other Users: Profile information you choose to make public
• With Landlords: When you apply to listings or request tours
• With Service Providers: Third parties who help us operate the App
• When Required by Law: To comply with legal obligations

We do NOT sell your personal information to third parties.
""")
                            .foregroundStyle(.secondary)
                    }
                    
                    Group {
                        Text("Data Security")
                            .font(.headline)
                        Text("We implement industry-standard security measures including encryption, secure authentication, and regular security audits. However, no method of transmission over the Internet is 100% secure.")
                            .foregroundStyle(.secondary)
                    }
                    
                    Group {
                        Text("Your Rights")
                            .font(.headline)
                        Text("""
You have the right to:
• Access: View and download your personal data
• Correct: Update inaccurate information in your profile
• Delete: Request deletion of your account and associated data
• Opt Out: Unsubscribe from marketing communications
""")
                            .foregroundStyle(.secondary)
                    }
                    
                    Group {
                        Text("Contact")
                            .font(.headline)
                        Text("For privacy inquiries, contact us at admin@collegio.us")
                            .foregroundStyle(.secondary)
                    }
                    
                    Text("Last updated: January 2, 2026")
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                }
                .padding()
                .padding(.bottom, 100)
            }
        }
        .navigationTitle("Privacy Policy")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Legal Info View
struct LegalInfoView: View {
    var body: some View {
        ZStack {
            GradientBackground()
            
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    Group {
                        Text("Copyright Notice")
                            .font(.headline)
                        Text("© 2025 Collegio. All rights reserved. The Collegio name, logo, and all related marks are trademarks of Collegio. Unauthorized use is prohibited.")
                            .foregroundStyle(.secondary)
                    }
                    
                    Group {
                        Text("Platform Disclaimer")
                            .font(.headline)
                        Text("""
Collegio is a platform that connects users for housing rentals, roommate matching, buying and selling items, and community engagement.

We do not own, manage, or control any properties or items listed on the platform. All listings are provided by third-party users.

We make no warranties regarding the accuracy, completeness, safety, or legality of any listing or item.
""")
                            .foregroundStyle(.secondary)
                    }
                    
                    Group {
                        Text("Transaction Disclaimer")
                            .font(.headline)
                        Text("""
All transactions are conducted directly between users. Collegio:
• Is not a party to any transaction
• Does not guarantee transactions or provide escrow services
• Does not verify the identity of all users
• Is not responsible for disputes between users

We strongly recommend meeting in public places and viewing properties in person before any payment.
""")
                            .foregroundStyle(.secondary)
                    }
                    
                    Group {
                        Text("Fair Housing Statement")
                            .font(.headline)
                        Text("Collegio is committed to fair housing. We do not discriminate based on race, color, religion, sex, national origin, disability, familial status, sexual orientation, gender identity, or any other protected class. All users must comply with the Fair Housing Act.")
                            .foregroundStyle(.secondary)
                    }
                    
                    Group {
                        Text("User Safety")
                            .font(.headline)
                        Text("""
Your safety is important. We recommend:
• Housing: Never send payment before viewing a property
• Roommates: Meet potential roommates in public first
• Marketplace: Meet in public, well-lit areas for exchanges
• Communication: Keep conversations on-platform initially
""")
                            .foregroundStyle(.secondary)
                    }
                    
                    Group {
                        Text("Open Source Acknowledgments")
                            .font(.headline)
                        Text("This app uses open source software including Mapbox SDK (BSD License) and various Swift packages under MIT/Apache licenses. Full license texts available upon request.")
                            .foregroundStyle(.secondary)
                    }
                    
                    Group {
                        Text("Contact")
                            .font(.headline)
                        Text("For legal inquiries, contact us at admin@collegio.us")
                            .foregroundStyle(.secondary)
                    }
                    
                    Text("Last updated: January 2, 2026")
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                }
                .padding()
                .padding(.bottom, 100)
            }
        }
        .navigationTitle("Legal Information")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    NavigationStack {
        PrivacySecurityView()
    }
}
