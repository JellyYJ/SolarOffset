import axios from "axios";
import { server as hostUrl } from "../../config";

export async function getAllUsers() {
    // add token to header to get authorization
    return axios.get(hostUrl + "/user/allUsers");
}

export async function updateUserStatus(options) {
    return axios.patch(hostUrl + "/user/status", options);
}

export async function updateUserRole(options) {
    return axios.patch(hostUrl + "/user/role", options);
}
