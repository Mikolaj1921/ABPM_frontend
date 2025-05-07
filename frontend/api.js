// api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://192.168.1.105:5000/api', // zamień na IP backendu jeśli testujesz na fizycznym urządzeniu
});

export default API;
