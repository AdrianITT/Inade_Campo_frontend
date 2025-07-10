import axios from "axios";
import { Api_Host } from "../Api";

const Login_Api = axios.create({
  baseURL: Api_Host.defaults.baseURL + '/login/',
});
// const Login_Api = axios.create({
//    baseURL: "https://test.simplaxi.com/api/login/",
//  });

export default Login_Api;