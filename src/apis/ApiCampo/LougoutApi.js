import axios from "axios";
import { Api_Host } from "../Api";

const Logout_Api = axios.create({
  baseURL: Api_Host.defaults.baseURL + '/logout/',
});

export default Logout_Api;