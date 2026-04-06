import axios from "axios";
export const getBackendErrorMessage = (error, fallback) => {
    if (!axios.isAxiosError(error)) {
        return fallback;
    }
    const data = error.response?.data;
    const fieldErrors = data?.details?.fieldErrors;
    if (fieldErrors) {
        const firstFieldError = Object.values(fieldErrors)
            .flat()
            .find((item) => typeof item === "string" && item.trim().length > 0);
        if (firstFieldError) {
            return firstFieldError;
        }
    }
    const firstFormError = data?.details?.formErrors?.find((item) => typeof item === "string" && item.trim().length > 0);
    if (firstFormError) {
        return firstFormError;
    }
    if (typeof data?.message === "string" && data.message.trim().length > 0) {
        return data.message;
    }
    return fallback;
};
