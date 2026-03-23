// Stripe Payment Service - TuneCasa Pattern
// Reference: https://stripe.com/docs/payments/checkout
// Adapted from INTERNATION PAYMET project

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe Checkout Session (hosted by Stripe)
 * User is redirected to Stripe's page to pay, then back to our site
 */
export const createCheckoutSession = async ({ courseTitle, amount, currency = 'usd', courseId, userId, successUrl, cancelUrl }) => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency,
                product_data: {
                    name: courseTitle || `LearnHub Course #${courseId}`,
                    description: 'Full lifetime access to course content',
                },
                unit_amount: Math.round(amount), // amount in cents
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
            course_id: String(courseId),
            user_id: String(userId),
        },
    });

    return session;
};

/**
 * Retrieve a checkout session by ID
 */
export const getSession = async (sessionId) => {
    return await stripe.checkout.sessions.retrieve(sessionId);
};

/**
 * Get Stripe publishable key (safe for frontend)
 */
export const getPublishableKey = () => {
    return process.env.STRIPE_PUBLISHABLE_KEY;
};
