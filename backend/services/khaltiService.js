// Khalti Payment Service - TuneCasa Pattern
// Reference: https://docs.khalti.com/khalti-epayment/
// Adapted from INTERNATION PAYMET project
//
// Khalti Web Checkout (KPG-2) Integration
// - Amount must be in PAISA (1 NPR = 100 paisa)
// - Test credentials: 9800000000-9800000005 / MPIN: 1111 / OTP: 987654

// Khalti Configuration
const KHALTI_CONFIG = {
    secretKey: process.env.KHALTI_SECRET_KEY || 'live_secret_key_68791341fdd94846a146f0457ff7b455',
    // Sandbox: https://dev.khalti.com/api/v2/
    // Production: https://khalti.com/api/v2/
    baseUrl: process.env.KHALTI_BASE_URL || 'https://dev.khalti.com/api/v2'
};

/**
 * Initiate Khalti Payment
 * @param {number} amount - Amount in NPR (will be converted to paisa)
 * @param {string} orderId - Unique order identifier
 * @param {string} host - Host URL for callback
 * @returns {Promise<Object>} - Contains pidx and payment_url
 */
export const initiatePayment = async (amount, orderId, host) => {
    const amountInPaisa = Math.round(amount * 100); // Convert NPR to paisa

    const payload = {
        return_url: `${host}/api/payment/khalti/callback`,
        website_url: host,
        amount: amountInPaisa,
        purchase_order_id: orderId,
        purchase_order_name: `LearnHub Course #${orderId}`
    };

    const response = await fetch(`${KHALTI_CONFIG.baseUrl}/epayment/initiate/`, {
        method: 'POST',
        headers: {
            'Authorization': `Key ${KHALTI_CONFIG.secretKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('Khalti initiate error:', data);
        throw new Error(data.detail || data.error_key || 'Failed to initiate payment');
    }

    return data; // { pidx, payment_url, expires_at, expires_in }
};

/**
 * Verify/Lookup Khalti Payment
 * @param {string} pidx - Payment identifier from Khalti
 * @returns {Promise<Object>} - Payment status details
 */
export const verifyPayment = async (pidx) => {
    const response = await fetch(`${KHALTI_CONFIG.baseUrl}/epayment/lookup/`, {
        method: 'POST',
        headers: {
            'Authorization': `Key ${KHALTI_CONFIG.secretKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pidx })
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('Khalti lookup error:', data);
        throw new Error(data.detail || 'Failed to verify payment');
    }

    return data; // { pidx, total_amount, status, transaction_id, fee, refunded }
};
