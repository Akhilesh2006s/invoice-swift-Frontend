// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://invoice-swift-backend-production.up.railway.app';

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  },
  ANALYTICS: {
    OVERVIEW: `${API_BASE_URL}/api/analytics/overview`,
    TOP_PRODUCTS: `${API_BASE_URL}/api/analytics/top-products`,
    TOP_CUSTOMERS: `${API_BASE_URL}/api/analytics/top-customers`,
    PAYMENTS: `${API_BASE_URL}/api/analytics/payments`,
    UPDATE: `${API_BASE_URL}/api/analytics/update`,
    STREAM: `${API_BASE_URL}/api/analytics/stream`,
  },
  INVOICES: `${API_BASE_URL}/api/invoices`,
  CUSTOMERS: `${API_BASE_URL}/api/customers`,
  VENDORS: `${API_BASE_URL}/api/vendors`,
  ITEMS: `${API_BASE_URL}/api/items`,
  PAYMENTS: `${API_BASE_URL}/api/payments`,
  EXPENSES: `${API_BASE_URL}/api/expenses`,
  PURCHASES: `${API_BASE_URL}/api/purchases`,
  QUOTATIONS: `${API_BASE_URL}/api/quotations`,
  PROFORMAS: `${API_BASE_URL}/api/proformas`,
  PURCHASE_ORDERS: `${API_BASE_URL}/api/purchase-orders`,
  CREDIT_NOTES: `${API_BASE_URL}/api/credit-notes`,
  DEBIT_NOTES: `${API_BASE_URL}/api/debit-notes`,
  DELIVERY_CHALLANS: `${API_BASE_URL}/api/delivery-challans`,
  INVENTORY: `${API_BASE_URL}/api/inventory`,
  STORES: `${API_BASE_URL}/api/stores`,
  COMPANY: `${API_BASE_URL}/api/company`,
  BANK_ACCOUNTS: `${API_BASE_URL}/api/bank-accounts`,
  REPORTS: `${API_BASE_URL}/api/reports`,
  CHATBOT: `${API_BASE_URL}/api/chatbot`,
};

export default API_BASE_URL;

