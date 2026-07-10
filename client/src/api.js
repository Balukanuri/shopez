import axios from "axios";

const API = axios.create({
  baseURL: "https://shopez-ezv3.onrender.com/api",
});

export default API;