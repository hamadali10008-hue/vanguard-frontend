import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7066/api', // 💡 Double check your port matches here
});

// 🔒 THE AUTOMATIC SECURITY GATE: Attach the token to every request header!
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Strip out any accidental wrapping quotes from stringification
        const cleanToken = token.replace(/['"]+/g, '');
        
        // 💡 INJECT THE BEARER TOKEN: This puts the badge on your request!
        config.headers.Authorization = `Bearer ${cleanToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;