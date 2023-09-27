import axios from "axios";
import { server as hostUrl } from "../../config";

export async function getStaffStatistics() {
    return axios.get(hostUrl + "/user/staff/statistics");
}

export async function getAllPayments() {
    return axios.get(hostUrl + "/payments/allPayments");
}
