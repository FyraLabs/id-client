import axios from "axios";

export const api = axios.create({
  baseURL: "https://accounts-api.fyralabs.com/",
});
