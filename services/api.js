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
     // const userId = Date.now().toString();
      // Generate a simple token (in production, use JWT)
      const token = `token_${Date.now()}_${userId}`;
      const newUser = {
        id: userId,
        name: userData.name,
        email: userData.email,
        organization: userData.organization,
        password: userData.password, // In production, store hashed password
        profileImage: null, // ✅ Add this line
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
          profileImage: response.data.profileImage, // ✅ Add this line
        },
        token: token,
      };
    } catch (error) {
      throw error;
    }
  },
  // ✅ New update function
  // updateProfile: async (userId, fieldsToUpdate) => {
  //   const response = await api.put(`/users/${userId}`, fieldsToUpdate);
  //   return response.data;
  // },
  // FIXED: Use PUT instead of PATCH for json-server
  updateProfile: async (userId, fieldsToUpdate) => {
    // First get the current user data
    const currentUser = await api.get(`/users/${userId}`);
    console.log("Current user data:", userId);
    // Merge the existing data with the updates
    const updatedUser = {
      ...currentUser.data,
      ...fieldsToUpdate,
    };

    // Use PUT to update the entire user object
    const response = await api.put(`/users/${userId}`, updatedUser);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log("Searching for user with email:", credentials.email);

      const response = await api.get(
        `/users?email=${credentials.email}&password=${credentials.password}`
      );

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
};

export default api;
