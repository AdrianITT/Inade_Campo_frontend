import axios from "axios";
import { Api_Host } from "../Api";
// const isLocalhost = window.location.hostname === "localhost" ;
// const Login_Api = axios.create({
//   baseURL: Api_Host.defaults.baseURL + '/login/',
// });
// const Login_Api = axios.create({
//    baseURL: "https://test.simplaxi.com/api/login/",
//  });

const baseURL = Api_Host.defaults.baseURL + '/login/';


export const Login_Api = axios.create({ baseURL});

export const TimeExired = 1 * 60 * 1000; // 15 minutos en milisegundos

export default Login_Api;