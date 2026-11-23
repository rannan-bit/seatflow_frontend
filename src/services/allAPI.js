import apiService from "../api/apiService";
import axios from "axios";

// Authentication
// Returns a JWT that the axios interceptor attaches to every request.
export const loginAPI = async (credentials) => {
    return await apiService("POST", "/login", credentials);
};

// Staff accounts (admin only)
// Routes are protected by the admin JWT stored in session storage.
export const addStaffAPI = async (staff) => {
    return await apiService("POST", "/add-staff", staff);
};

export const getAllStaffAPI = async () => {
    return await apiService("GET", "/all-staff");
};

export const updateStaffAPI = async (staffId, updates) => {
    return await apiService("PUT", `/staff-update/${staffId}`, updates);
};

export const deleteStaffAPI = async (staffId) => {
    return await apiService("DELETE", `/staff-delete/${staffId}`);
};

// Customer check-in
// Backend validates the customer, generates the queue token and saves the record.
export const checkInCustomerAPI = async (customer) => {
    return await apiService("POST", "/customer/check-in", customer);
};

// Customer queue status
// Backend looks up the token and returns the latest queue info + FIFO position.
export const getCustomerQueueStatusAPI = async (token) => {
    return await apiService("GET", `/customer/queue-status/${encodeURIComponent(token)}`);
};

// Menu
// Fetch every food item saved in MongoDB. Search and category filtering stay client-side.
export const getAllFoodsAPI = async () => {
    return await apiService("GET", "/all-foods");
};

// Admin - menu management
// Create/update send multipart/form-data because the dish image is uploaded with the form.
export const addFoodAPI = async (formData) => {
    return await apiService("POST", "/food-add", formData);
};

export const updateFoodAPI = async (foodId, formData) => {
    return await apiService("PUT", `/food-update/${foodId}`, formData);
};

export const deleteFoodAPI = async (foodId) => {
    return await apiService("DELETE", `/food-delete/${foodId}`);
};

export const changeFoodAvailabilityAPI = async (foodId, available) => {
    return await apiService("PATCH", `/food-availability/${foodId}`, { available });
};

// Orders
// Backend validates the queue token and item ids, then prices the order itself.
export const createOrderAPI = async (order) => {
    return await apiService("POST", "/order-add", order);
};

// Customer orders
// Returns every order placed under the customer's queue token, newest first.
export const getCustomerOrdersAPI = async (token) => {
    return await apiService("GET", `/customer/orders/${encodeURIComponent(token)}`);
};

// Staff - queue and tables
// Queue and table routes require the staff/admin JWT from session storage.
export const getAllQueuesAPI = async (status, date) => {
    const params = new URLSearchParams();

    if (status) {
        params.append("status", status);
    }

    if (date) {
        params.append("date", date);
    }

    const query = params.toString();

    const url = query
        ? `/all-queues?${query}`
        : "/all-queues";

    return await apiService("GET", url);
};

export const getAllTablesAPI = async (status) => {
    const url = status ? `/all-tables?status=${encodeURIComponent(status)}` : "/all-tables";
    return await apiService("GET", url);
};

// Admin - table management
export const addTableAPI = async ({ tableNumber, capacity, status }) => {
    return await apiService("POST", "/table-add", { tableNumber, capacity, status });
};

export const updateTableAPI = async (tableId, updates) => {
    return await apiService("PUT", `/table-update/${tableId}`, updates);
};

export const deleteTableAPI = async (tableId) => {
    return await apiService("DELETE", `/table-delete/${tableId}`);
};

export const changeTableStatusAPI = async (tableId, status) => {
    return await apiService("PATCH", `/table-status/${tableId}`, { status });
};

export const assignTableAPI = async ({ tableId, queueId }) => {
    return await apiService("POST", "/assign-table", { tableId, queueId });
};

export const updateQueueStatusAPI = async (queueId, status) => {
    return await apiService("PATCH", `/queue-status/${queueId}`, { status });
};

// Staff - orders
export const getAllOrdersAPI = async (status, date) => {
    const params = new URLSearchParams();

    if (status) {
        params.append("status", status);
    }

    if (date) {
        params.append("date", date);
    }

    const query = params.toString();

    const url = query
        ? `/all-orders?${query}`
        : "/all-orders";

    return await apiService("GET", url);
};

export const updateOrderStatusAPI = async (orderId, updates) => {
    return await apiService("PATCH", `/order-status/${orderId}`, updates);
};

// Customer - Web Push subscription
export const savePushSubscriptionAPI = async (data) => {
    return await apiService("POST", "/customer/push-subscription", data);
};

// AI Food Assistant
export const chatWithAIAPI = async (message) => {
    try {
        const localResponse = await axios.post(
            "http://localhost:3000/api/chat",
            { message },
            { timeout: 7000 }
        );
        if (localResponse?.data?.response) {
            return localResponse;
        }
    } catch {
        // Fall back to configured apiService (e.g. Render)
    }

    return await apiService("POST", "/api/chat", { message });
};
