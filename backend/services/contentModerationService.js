import OpenAI from 'openai';

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
}) : null;

// List of explicit banned words as a fallback
const BANNED_WORDS = [
    // Slurs and hate speech terms
    'nigger', 'nigga', 'faggot', 'fag', 'retard', 'spic', 'chink', 'kike',
    'cunt', 'bitch', 'whore', 'slut',
    // Add more as needed
];

/**
 * Check content for inappropriate material using OpenAI moderation
 * @param {string} text - The text to check
 * @returns {Promise<{safe: boolean, reason?: string, categories?: object}>}
 */
export const checkContent = async (text) => {
    if (!text || text.trim().length === 0) {
        return { safe: true };
    }

    // First, do a basic banned word check for explicit slurs
    const lowercaseText = text.toLowerCase();
    for (const word of BANNED_WORDS) {
        if (lowercaseText.includes(word)) {
            return {
                safe: false,
                reason: 'Your message contains inappropriate language. Please revise and try again.',
            };
        }
    }

    // Use OpenAI moderation API if available
    if (openai) {
        try {
            const response = await openai.moderations.create({
                input: text,
            });

            const result = response.results[0];

            if (result.flagged) {
                // Determine which category was flagged
                const flaggedCategories = [];
                for (const [category, flagged] of Object.entries(result.categories)) {
                    if (flagged) {
                        flaggedCategories.push(category.replace(/[_-]/g, ' '));
                    }
                }

                // Create user-friendly reason
                let reason = 'Your message was flagged for potentially containing ';
                if (flaggedCategories.includes('hate')) {
                    reason = 'Your message contains hateful content. Please be respectful to all community members.';
                } else if (flaggedCategories.includes('harassment')) {
                    reason = 'Your message contains harassing content. Please be kind to others.';
                } else if (flaggedCategories.includes('sexual')) {
                    reason = 'Your message contains inappropriate sexual content.';
                } else if (flaggedCategories.includes('violence')) {
                    reason = 'Your message contains violent content.';
                } else if (flaggedCategories.includes('self harm')) {
                    reason = 'Your message contains concerning content. If you need help, please reach out to campus resources.';
                } else {
                    reason = 'Your message was flagged as potentially inappropriate. Please revise and try again.';
                }

                return {
                    safe: false,
                    reason,
                    categories: result.categories,
                    scores: result.category_scores,
                };
            }

            return { safe: true };
        } catch (error) {
            console.error('OpenAI moderation error:', error);
            // Fall through to basic check if API fails
        }
    }

    // If no OpenAI, just use the basic banned word check (already done above)
    return { safe: true };
};

/**
 * Check if reported content should be removed
 * @param {string} text - The reported content
 * @param {string} reportReason - Why it was reported
 * @returns {Promise<{shouldRemove: boolean, confidence: number, reason?: string}>}
 */
export const reviewReportedContent = async (text, reportReason) => {
    const moderationResult = await checkContent(text);

    if (!moderationResult.safe) {
        return {
            shouldRemove: true,
            confidence: 0.9,
            reason: moderationResult.reason,
        };
    }

    // Even if not flagged by main moderation, check if there are elevated scores
    if (moderationResult.scores) {
        const highScoreCategories = Object.entries(moderationResult.scores)
            .filter(([_, score]) => score > 0.3)
            .map(([category]) => category);

        if (highScoreCategories.length > 0) {
            return {
                shouldRemove: false,
                confidence: 0.5,
                reason: 'Content has elevated risk scores but was not definitively flagged. Manual review recommended.',
                flaggedCategories: highScoreCategories,
            };
        }
    }

    return {
        shouldRemove: false,
        confidence: 0.8,
        reason: 'Content appears to be safe.',
    };
};

export default {
    checkContent,
    reviewReportedContent,
};
