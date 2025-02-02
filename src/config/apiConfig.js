const API_ENDPOINTS = {
	CUSTOMERS: `${import.meta.env.VITE_API_PREFIX}/customer`,
	USERS: `${import.meta.env.VITE_API_PREFIX}/users`,
	TREATMENTS: `${import.meta.env.VITE_API_PREFIX}/treatment`,
	MEDICINES: `${import.meta.env.VITE_API_PREFIX}/medicine`,
	MEDICAL_CONDITIONS: `${import.meta.env.VITE_API_PREFIX}/medical-condition`,
	LOGIN: `${import.meta.env.VITE_API_PREFIX}/`,
	APPOINTMENTS: `${import.meta.env.VITE_API_PREFIX}/appointments`,
	STAFF_MEMBERS: `${import.meta.env.VITE_API_PREFIX}/staff-member`,
	EXPENSES: `${import.meta.env.VITE_API_PREFIX}/expense`,
	AUTH: `${import.meta.env.VITE_API_PREFIX}/auth`,
	MEDIA_UPLOAD: `${import.meta.env.VITE_API_PREFIX}/media`,
	CASE_HISTORY: `${import.meta.env.VITE_API_PREFIX}/case-history`,
	PAYMENTS: `${import.meta.env.VITE_API_PREFIX}/payments`,
	USER_FEATURE_PERMISSIONS: `${import.meta.env.VITE_API_PREFIX}/feature-permission/user/permission`,
	INVOICE: `${import.meta.env.VITE_API_PREFIX}/invoice`,
	DASHBOARD: `${import.meta.env.VITE_API_PREFIX}/dashboard`,
	CUSTOMER: `${import.meta.env.VITE_API_PREFIX}/customer`,
	REMINDER: `${import.meta.env.VITE_API_PREFIX}/reminder`,
};

export default API_ENDPOINTS;
