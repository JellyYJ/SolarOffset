import axios from "axios";
import { server as hostUrl } from "../../config";
import { getAuthTokenFromCookie } from "./utils";

axios.defaults.withCredentials = true;

// Add a request interceptor
axios.interceptors.request.use(
    (config) => {
        const token = getAuthTokenFromCookie();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export async function getCarbonIntensity(options) {
    const region = options.region;
    return axios.get(hostUrl + "/carbonIntensity/" + region);
}

export async function getUKCarbonIntensity(options) {
    return axios.get(hostUrl + "/carbon/national");
}

export const getCountryData = async () => {
    try {
        const response = await axios.get(hostUrl + "/country/list");
        return response.data;
    } catch (err) {
        console.log(err);
        throw new Error("Error retrieving countries from server");
    }
};

export const getCompareCountriesById = async (countryId1, countryId2) => {
    try {
        const response = await axios.get(hostUrl + `/compare/${countryId1}/${countryId2}`);
        return response.data;
    } catch (err) {
        console.log(err);
        throw new Error("Error retrieving compare countries from server");
    }
};

export const getCountryDetails = async (countryId) => {
    try {
        const response = await axios.get(`${hostUrl}/country/${countryId}`);
        return response.data;
    } catch (err) {
        console.log(err);
        throw new Error("Error retrieving country details from server");
    }
};

export async function postLogin(options) {
    // return axios.post(hostUrl + "/user/login", options, {
    //     withCredentials: true,
    // });
    return axios.post(hostUrl + "/user/login", options);
}

export async function postLogout() {
    return axios.post(hostUrl + "/user/logout", {});
}

export async function register(options) {
    return axios.put(hostUrl + "/user/register", options);
}

export async function postStripePayment(options) {
    return axios.post(hostUrl + "/payments/create-checkout-session", options);
}

export async function getCurrentUserInfo() {
    return axios.get(hostUrl + `/user/current/info`);
}

export async function getUserInfo({ userId }) {
    return axios.get(hostUrl + `/user/info/${userId}`);
}

export async function getCarbonInfo({ userId }) {
    return axios.get(hostUrl + `/user/carbonInfo/${userId}`);
}

/*export async function getPaymentsByEmail({ email }) {
    return axios.get(hostUrl + `/payments/paymentsByEmail/${email}`, { headers: authHeaders });
}*/

export async function validStripePayment(options) {
    return axios.post(hostUrl + "/payments/validate-payment", options);
}

export async function updateUserName(userId, name) {
    try {
        const response = await axios.patch(hostUrl + "/user/name", { userId, name });
        return response.data;
    } catch (err) {
        // console.log(err.response);
        console.log(err.message);
        throw new Error("Error updating user's name");
    }
}

export async function updateUserPassword(userId, oldPassword, newPassword) {
    try {
        const response = await axios.patch(hostUrl + "/user/password", { userId, oldPassword, newPassword });
        return response.data;
    } catch (err) {
        console.log(err.message);
        throw new Error("Error updating user's password");
    }
}

export async function updateFootprint(options) {
    try {
        const response = await axios.post(hostUrl + "/user/footprint", options);
        return response;
    } catch (err) {
        console.log(err.message);
    }
}
