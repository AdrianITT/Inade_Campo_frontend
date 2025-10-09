import axios from "axios";
import { Api_Host } from "../Api";

const Login_Api = axios.create({
  baseURL: Api_Host.defaults.baseURL + '/login/',
});
// const Login_Api = axios.create({
//    baseURL: "https://test.simplaxi.com/api/login/",
//  });
export const TimeExired = 1 * 60 * 1000; // 15 minutos en milisegundos

export default Login_Api;