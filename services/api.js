import axios from "axios";

//const BASE_URL = 'http://localhost:3000'; // For web
const BASE_URL = "http://192.168.29.173:3000"; // For mobile device

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authAPI = {
  
  signup: async (userData) => {
    try {
      // Check if user already exists
      const existingUsers = await api.get(`/users?email=${userData.email}`);
      if (existingUsers.data.length > 0) {
        throw new Error("User already exists");
      }
      // Create new user
      // Generate ID first
      const userId = Date.now();
      // Generate a simple token (in production, use JWT)
      const token = `token_${Date.now()}_${userId}`;
      const newUser = {
        id: userId,
        name: userData.name,
        email: userData.email,
        organization: userData.organization,
        password: userData.password, // In production, store hashed password
        createdAt: new Date().toISOString(),
        token: token,
      };

      const response = await api.post("/users", newUser);

      return {
        user: {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          organization: response.data.organization,
        },
        token: token,
      };
    } catch (error) {
      throw error;
    }
  },
  // Login user
  login: async (credentials) => {
  try {
    console.log("Searching for user with email:", credentials.email);
    
    const response = await api.get(`/users?email=${credentials.email}&password=${credentials.password}`);
    
    console.log("API found users:", response.data);
    
    if (response.data.length === 0) {
      throw new Error("Invalid credentials");
    }

    const user = response.data[0];
    console.log("User found:", user);

    return user;
  } catch (error) {
    throw error;
  }
},
  // Logout user

};

export default api;
