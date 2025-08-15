import axios from "axios";

const API = axios.create({
  baseURL: "https://electronic-dukaan.onrender.com", // Render backend URL
  withCredentials: true, // send cookies
});

export default API;

