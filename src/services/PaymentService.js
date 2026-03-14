import api from '../api/axios';

const PaymentService = {
    // Initialize Wompi Transaction
    initWompiTransaction: async (pedidoId) => {
        const response = await api.post('/payments/wompi/init', { pedido_id: pedidoId });
        console.log('📦 PaymentService Response:', response.data);
        return response.data;
    },


    // Verify Wompi Transaction Status with Backend
    verifyWompiTransaction: async (transactionId) => {
        const response = await api.post('/payments/wompi/verify', { transaction_id: transactionId });
        return response.data;
    },


    // Confirm Payment (Manual/Legacy)
    confirmPayment: async (pagoId) => {
        const response = await api.post(`/payments/${pagoId}/confirm`);
        return response.data;
    }
};

export default PaymentService;
