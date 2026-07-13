import axios from "axios";
const isLocalhost = window.location.hostname === "localhost" ;
// export const Api_Host = axios.create({
//   baseURL: 'http://localhost:8000/api'
// });
// export const Api_Host = axios.create({
//   baseURL: 'https://test.simplaxi.com/api'
// });

const baseURL = isLocalhost 
? process.env.REACT_APP_BASE_URL
: process.env.REACT_APP_API_URL;

export const Api_Host = axios.create({ baseURL});

// Interceptor para agregar el token a cada solicitud
Api_Host.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
