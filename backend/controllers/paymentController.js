// Payment Controller - TuneCasa Pattern
// Handles Stripe + Khalti payment operations
// Adapted from INTERNATION PAYMET project
import { Payment } from '../models/Payment.js';
import * as stripeService from '../services/stripeService.js';
import * as khaltiService from '../services/khaltiService.js';

// ==================== STRIPE ====================

// Get Stripe publishable key (safe for frontend)
export const getStripeConfig = async (req, res) => {
    try {
        res.status(200).json({
            message: "Stripe config fetched",
            data: { publishableKey: stripeService.getPublishableKey() }
        });
    } catch (error) {
        console.error('Get Stripe config error:', error);
        res.status(500).json({ message: "Failed to get Stripe config", error: error.message });
    }
};

// Create Stripe Checkout Session (redirects user to Stripe's hosted page)
export const createStripePayment = async (req, res) => {
    const { amount, currency, course_id, course_title } = req.body;
    const user_id = req.user?.user_id;

    if (!amount || amount < 50) {
        return res.status(400).json({ message: "Amount must be at least $0.50" });
    }

    if (!course_id) {
        return res.status(400).json({ message: "course_id is required" });
    }

    try {
        const host = `${req.protocol}://${req.get('host')}`;
        const frontendUrl = 'http://localhost:5173';

        // Create Stripe Checkout Session
        const session = await stripeService.createCheckoutSession({
            courseTitle: course_title,
            amount: Math.round(amount),
            currency: currency || 'usd',
            courseId: course_id,
            userId: user_id,
            successUrl: `${frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&provider=stripe`,
            cancelUrl: `${frontendUrl}/payment-failure?reason=canceled`
        });

        // Save payment record to Oracle
        const paymentId = await Payment.create({
            user_id,
            course_id,
            provider: 'stripe',
            amount: amount / 100,
            currency: currency || 'usd',
            status: 'pending',
            transaction_id: session.id
        });

        res.status(200).json({
            message: "Checkout session created",
            data: {
                sessionId: session.id,
                checkoutUrl: session.url,
                paymentId
            }
        });
    } catch (error) {
        console.error('Create Stripe checkout error:', error);
        res.status(500).json({ message: "Failed to create checkout", error: error.message });
    }
};

// Verify Stripe session & update payment status
export const getStripePaymentStatus = async (req, res) => {
    const { sessionId } = req.params;

    try {
        const session = await stripeService.getSession(sessionId);

        // Update payment status in Oracle
        const payment = await Payment.findByTransactionId(sessionId);
        if (payment) {
            const newStatus = session.payment_status === 'paid' ? 'completed' : session.payment_status;
            await Payment.updateStatus(payment.payment_id, newStatus);
        }

        res.status(200).json({
            message: "Payment status fetched",
            data: {
                status: session.payment_status,
                amount: session.amount_total,
                currency: session.currency
            }
        });
    } catch (error) {
        console.error('Get session status error:', error);
        res.status(500).json({ message: "Failed to get payment status", error: error.message });
    }
};

// ==================== KHALTI ====================

// Initiate Khalti payment
export const initiateKhaltiPayment = async (req, res) => {
    const { amount, course_id } = req.body;
    const user_id = req.user?.user_id;

    if (!amount || amount < 10) {
        return res.status(400).json({ message: "Amount must be at least NPR 10" });
    }

    if (!course_id) {
        return res.status(400).json({ message: "course_id is required" });
    }

    try {
        // Generate unique order ID
        const orderId = `LH-${course_id}-${Date.now()}`;
        const host = `${req.protocol}://${req.get('host')}`;

        // Initiate Khalti payment
        const paymentData = await khaltiService.initiatePayment(amount, orderId, host);

        // Save payment record to Oracle
        const paymentId = await Payment.create({
            user_id,
            course_id,
            provider: 'khalti',
            amount,
            currency: 'npr',
            status: 'pending',
            pidx: paymentData.pidx
        });

        console.log('Khalti payment initiated:', paymentData);

        res.status(200).json({
            message: "Khalti payment initiated",
            data: {
                ...paymentData,
                paymentId
            }
        });
    } catch (error) {
        console.error('Khalti initiate error:', error);
        res.status(500).json({ message: "Failed to initiate Khalti payment", error: error.message });
    }
};

// Handle Khalti callback (user is redirected here after payment)
export const handleKhaltiCallback = async (req, res) => {
    const { pidx, status, transaction_id, amount, purchase_order_id } = req.query;

    console.log('Khalti callback received:', req.query);

    if (status === 'Completed') {
        try {
            // Verify the payment with Khalti
            const verification = await khaltiService.verifyPayment(pidx);
            console.log('Khalti payment verified:', verification);

            if (verification.status === 'Completed') {
                // Update payment in Oracle
                const payment = await Payment.findByPidx(pidx);
                if (payment) {
                    await Payment.updateStatus(payment.payment_id, 'completed', transaction_id);
                }

                // Redirect to frontend success page
                res.redirect(`http://localhost:5173/payment-success?pidx=${pidx}&amount=${amount}&order=${purchase_order_id}&provider=khalti`);
            } else {
                res.redirect(`http://localhost:5173/payment-failure?reason=verification_failed`);
            }
        } catch (error) {
            console.error('Khalti verification error:', error);
            res.redirect(`http://localhost:5173/payment-failure?reason=verification_error`);
        }
    } else if (status === 'User canceled') {
        res.redirect(`http://localhost:5173/payment-failure?reason=canceled`);
    } else {
        res.redirect(`http://localhost:5173/payment-failure?reason=${status || 'unknown'}`);
    }
};

// Verify Khalti payment (API endpoint)
export const verifyKhaltiPayment = async (req, res) => {
    const { pidx } = req.body;

    if (!pidx) {
        return res.status(400).json({ message: "pidx is required" });
    }

    try {
        const result = await khaltiService.verifyPayment(pidx);

        // Update in Oracle
        const payment = await Payment.findByPidx(pidx);
        if (payment && result.status === 'Completed') {
            await Payment.updateStatus(payment.payment_id, 'completed', result.transaction_id);
        }

        res.status(200).json({
            message: "Payment verified",
            data: result
        });
    } catch (error) {
        console.error('Khalti verify error:', error);
        res.status(500).json({ message: "Failed to verify payment", error: error.message });
    }
};

// ==================== COMMON ====================

// Get user's purchase history
export const getUserPayments = async (req, res) => {
    const { userId } = req.params;

    try {
        const payments = await Payment.findByUser(userId);

        res.status(200).json({
            message: "Successfully fetched user payments",
            data: payments
        });
    } catch (error) {
        console.error('Get user payments error:', error);
        res.status(500).json({ message: "Failed to fetch payments", error: error.message });
    }
};

// Check if user purchased a specific course
export const checkPurchase = async (req, res) => {
    const { userId, courseId } = req.params;

    try {
        const purchased = await Payment.hasPurchased(parseInt(userId), parseInt(courseId));

        res.status(200).json({
            message: "Purchase check completed",
            data: { purchased }
        });
    } catch (error) {
        console.error('Check purchase error:', error);
        res.status(500).json({ message: "Failed to check purchase", error: error.message });
    }
};
