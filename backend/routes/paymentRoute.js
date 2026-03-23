// Payment Routes - TuneCasa Pattern
// Reference: INTERNATION PAYMET project
import { Router } from 'express';
import errorHandler from '../services/catchAsyncError.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';
import {
    getStripeConfig,
    createStripePayment,
    getStripePaymentStatus,
    initiateKhaltiPayment,
    handleKhaltiCallback,
    verifyKhaltiPayment,
    getUserPayments,
    checkPurchase
} from '../controllers/paymentController.js';

const router = Router();

// ========== STRIPE ROUTES ==========
// GET /api/payment/stripe/config - Get publishable key (public)
router.route('/stripe/config').get(errorHandler(getStripeConfig));

// POST /api/payment/stripe/create-intent - Create payment intent (auth required)
router.route('/stripe/create-intent').post(requireAuth, errorHandler(createStripePayment));

// GET /api/payment/stripe/status/:sessionId - Get session status
router.route('/stripe/status/:sessionId').get(errorHandler(getStripePaymentStatus));

// ========== KHALTI ROUTES ==========
// POST /api/payment/khalti/initiate - Initiate Khalti payment (auth required)
router.route('/khalti/initiate').post(requireAuth, errorHandler(initiateKhaltiPayment));

// GET /api/payment/khalti/callback - Khalti callback (Khalti redirects here)
router.route('/khalti/callback').get(errorHandler(handleKhaltiCallback));

// POST /api/payment/khalti/verify - Verify Khalti payment
router.route('/khalti/verify').post(errorHandler(verifyKhaltiPayment));

// ========== COMMON ROUTES ==========
// GET /api/payment/user/:userId - Get user's payment history
router.route('/user/:userId').get(requireAuth, errorHandler(getUserPayments));

// GET /api/payment/check/:userId/:courseId - Check if user purchased course
router.route('/check/:userId/:courseId').get(errorHandler(checkPurchase));

export default router;
