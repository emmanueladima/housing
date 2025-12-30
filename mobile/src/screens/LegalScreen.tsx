import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

interface LegalScreenProps {
    navigation?: any;
    route?: any;
}

const termsContent = `Last Updated: December 2025

1. ACCEPTANCE OF TERMS

By accessing or using Collegio ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. These terms apply to all users, including students, landlords, property managers, and visitors.

2. ELIGIBILITY

To use Collegio, you must:
• Be at least 18 years of age
• Have a valid .edu email address (for student accounts) or verifiable business credentials (for landlord accounts)
• Provide accurate and complete registration information
• Maintain the security of your account credentials

3. USER ACCOUNTS

When you create an account, you agree to:
• Provide truthful information in your profile and listings
• Keep your login credentials confidential
• Notify us immediately of any unauthorized access to your account
• Accept responsibility for all activities under your account

4. LISTING AND HOUSING SERVICES

Collegio provides a platform for connecting students with housing opportunities. We do not:
• Own, manage, or control any listed properties
• Guarantee the accuracy of listing information
• Act as a real estate broker or agent
• Mediate disputes between landlords and tenants

Users are responsible for verifying all property information, conducting their own due diligence, and entering into lease agreements at their own discretion.

5. ROOMMATE MATCHING

Our AI-powered roommate matching feature uses lifestyle preferences to suggest compatible roommates. We do not guarantee compatibility or the accuracy of user-provided information. Users should exercise their own judgment when connecting with potential roommates and meet in safe, public places before making housing decisions together.

6. MESSAGING AND COMMUNICATION

When using our messaging system, you agree not to:
• Send spam, unsolicited messages, or promotional content
• Harass, threaten, or discriminate against other users
• Share illegal or inappropriate content
• Attempt to conduct transactions outside the platform to avoid safety features

7. PROHIBITED ACTIVITIES

Users may not:
• Post false, misleading, or fraudulent listings
• Impersonate others or misrepresent affiliations
• Violate fair housing laws or discriminate based on protected characteristics
• Scrape, harvest, or collect user data without authorization
• Interfere with the platform's operation or security
• Use the platform for any illegal purposes

8. CONTENT OWNERSHIP

You retain ownership of content you post (photos, descriptions, etc.) but grant Collegio a non-exclusive, royalty-free license to use, display, and distribute this content on the platform. We may remove content that violates these terms without notice.

9. DISCLAIMER OF WARRANTIES

The Platform is provided "as is" without warranties of any kind. We do not warrant that the service will be uninterrupted, error-free, or secure. We are not responsible for the actions of users, the quality of listed properties, or outcomes of roommate matches.

10. LIMITATION OF LIABILITY

To the maximum extent permitted by law, Collegio shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform, including but not limited to disputes with landlords, roommates, or property issues.

11. ACCOUNT TERMINATION

We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time through your account settings. Upon termination, your right to use the platform ceases immediately.

12. CHANGES TO TERMS

We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the new terms. We will notify users of significant changes via email or platform notification.

13. CONTACT INFORMATION

For questions about these Terms of Service, please contact us at admin@collegio.us`;

const privacyContent = `Last Updated: December 2025

1. INTRODUCTION

Collegio ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our student housing platform. Please read this policy carefully to understand our practices regarding your personal data.

2. INFORMATION WE COLLECT

2.1 Information You Provide
• Account Information: Name, email address (.edu or business email), phone number, password
• Profile Information: Profile photo, age, university/college, major, graduation year
• Lifestyle Preferences: Sleep schedule, cleanliness habits, noise preferences, guest policies, study habits for roommate matching
• Listing Information: Property photos, addresses, descriptions, pricing, amenities (for landlords)
• Communications: Messages sent through our platform, support inquiries

2.2 Automatically Collected Information
• Device Information: Browser type, operating system, device identifiers
• Usage Data: Pages visited, features used, search queries, listings viewed
• Location Data: General location based on IP address for relevant search results
• Cookies: See our Cookie Policy for details

3. HOW WE USE YOUR INFORMATION

We use collected information to:
• Create and manage your account
• Provide roommate matching based on lifestyle compatibility
• Display relevant housing listings in your search area
• Facilitate messaging between users
• Send email notifications about messages, applications, and account activity
• Verify user identities through .edu email validation
• Improve our platform and develop new features
• Detect and prevent fraud, abuse, and security issues
• Comply with legal obligations

4. INFORMATION SHARING

We may share your information with:
• Other Users: Your profile information is visible to other users for roommate matching and messaging purposes
• Landlords: When you apply for a listing, landlords receive your contact information and application details
• Service Providers: Third parties who help us operate the platform (hosting, email, analytics)
• Legal Requirements: When required by law, court order, or governmental authority
• Safety: To protect the safety and security of users or the public

WE DO NOT SELL YOUR PERSONAL INFORMATION TO THIRD PARTIES.

5. DATA SECURITY

We implement industry-standard security measures to protect your data, including:
• Encrypted data transmission (HTTPS/TLS)
• Secure password hashing
• Regular security audits
• Access controls and authentication

However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your data.

6. YOUR RIGHTS AND CHOICES

You have the right to:
• Access: Request a copy of your personal data
• Correction: Update inaccurate information in your profile
• Deletion: Request deletion of your account and associated data
• Opt-out: Unsubscribe from marketing emails via email settings
• Data Portability: Request your data in a portable format

To exercise these rights, please contact us at admin@collegio.us

7. DATA RETENTION

We retain your personal data for as long as your account is active or as needed to provide services. After account deletion, we may retain certain information for legal, security, or business purposes for up to 90 days. Anonymized data may be retained indefinitely for analytics purposes.

8. THIRD-PARTY SERVICES

Our platform may contain links to third-party websites or integrate with external services (such as Mapbox for maps). These services have their own privacy policies, and we are not responsible for their practices. We encourage you to review their policies before providing any personal information.

9. CHILDREN'S PRIVACY

Collegio is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we learn that we have collected data from a child under 18, we will delete that information promptly.

10. INTERNATIONAL USERS

Collegio is primarily designed for users in the United States. If you access the platform from outside the U.S., your information may be transferred to and processed in the United States, where data protection laws may differ from your country.

11. CHANGES TO THIS POLICY

We may update this Privacy Policy periodically. We will notify you of significant changes via email or platform notification. Your continued use of Collegio after changes indicates acceptance of the updated policy.

12. CONTACT US

For questions or concerns about this Privacy Policy or our data practices, please contact:

Collegio Privacy Team
Email: admin@collegio.us`;

const aboutContent = `ABOUT COLLEGIO

Collegio is a student-focused housing and community platform designed to make finding your perfect living situation as easy as possible.

OUR MISSION

To simplify the housing search for students and create meaningful connections within college communities.

WHAT WE OFFER

🏠 Housing Listings
Browse verified rental listings near your campus. Filter by price, amenities, distance, and more.

👥 Roommate Matching
Find compatible roommates based on lifestyle, schedule, and preferences. Our AI-powered matching algorithm considers sleep schedules, cleanliness, noise preferences, guest policies, and more to find your perfect roommate match.

💬 Community
Connect with fellow students, share experiences, ask questions, and build your college network. Join discussions about housing, campus life, and more.

🛠️ Toolkit
Manage your living situation with our built-in tools for expense tracking, chores management, and move-in checklists.

FOUNDED

Collegio was founded by students, for students. We understand the challenges of finding housing and roommates because we've been there.

OUR VALUES

• Student First: Every feature is designed with students in mind
• Safety: Your security and privacy are our top priorities
• Community: Building connections that last beyond college
• Transparency: Clear communication and honest practices

CONTACT US

General: hello@collegio.us
Support: support@collegio.us
Privacy: admin@collegio.us

© 2025 Collegio. All rights reserved.`;

const LegalScreen: React.FC<LegalScreenProps> = ({ navigation, route }) => {
    const colors = useColors();
    const { isDark } = useTheme();
    const type = route?.params?.type || 'terms';

    const getContent = () => {
        switch (type) {
            case 'terms': return { title: 'Terms of Service', content: termsContent };
            case 'privacy': return { title: 'Privacy Policy', content: privacyContent };
            case 'about': return { title: 'About Collegio', content: aboutContent };
            default: return { title: 'Terms of Service', content: termsContent };
        }
    };

    const { title, content } = getContent();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        safeArea: {
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.md,
        },
        backButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.backgroundSecondary,
            borderRadius: BORDER_RADIUS.md,
        },
        title: {
            fontSize: FONT_SIZES.xl,
            fontWeight: '700',
            color: colors.text,
        },
        content: {
            flex: 1,
        },
        contentContainer: {
            paddingHorizontal: SPACING.lg,
        },
        card: {
            backgroundColor: colors.card,
            borderRadius: BORDER_RADIUS.xl,
            padding: SPACING.lg,
            ...SHADOWS.sm,
            borderWidth: 1,
            borderColor: colors.border,
        },
        contentText: {
            fontSize: FONT_SIZES.md,
            color: colors.textSecondary,
            lineHeight: 24,
        },
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation?.goBack()}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>{title}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    <Text style={styles.contentText}>{content}</Text>
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

export default LegalScreen;
