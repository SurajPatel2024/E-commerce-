import axios from "axios";

const API = axios.create({
  baseURL: "https://electronic-dukaan.onrender.com",
  withCredentials: true, // send cookies
});

export default API;
