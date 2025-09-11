import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authAPI } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Async Actions
// Login user
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const result = await authAPI.login(credentials);
      // Store token in AsyncStorage
      await AsyncStorage.setItem("userToken", result.token);
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          id: result.id,
          name: result.name,
          email: result.email,
          organization: result.organization,
          profileImage: result.profileImage || null,
        })
      );
      return result;
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

// Signup user
export const signupUser = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const result = await authAPI.signup(userData);

      // Store in AsyncStorage
      await AsyncStorage.setItem("userToken", result.token);
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          id: result.id,
          name: result.name,
          email: result.email,
          organization: result.organization,
          profileImage: result.profileImage || null,
        })
      );

      return result;
    } catch (error) {
      return rejectWithValue(error.message || "Signup failed");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("user");
      return null;
    } catch (error) {
      return rejectWithValue(error.message || "Logout failed");
    }
  }
);

// Check if user is authenticated (load from storage)
export const checkAuthState = createAsyncThunk(
  "auth/checkAuthState",
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const userData = await AsyncStorage.getItem("user");

      if (token && userData) {
        return {
          token,
          ...JSON.parse(userData),
        };
      }
      return null;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to check auth state");
    }
  }
);

// Update user profile (including all fields)
export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (updateData, { rejectWithValue }) => {
    try {
      const { userId, ...fieldsToUpdate } = updateData;

      console.log("🔄 Starting profile update...");
      console.log("👤 User ID:", userId);
    //  console.log("📝 Fields to update:", fieldsToUpdate);

      // Call the API to update the profile and get the updated user object
      const serverResponse = await authAPI.updateProfile(Number(userId),  fieldsToUpdate);
    //  console.log("✅ Server response:", serverResponse);

      // Save the updated user object to AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(serverResponse));

      // Return the updated user object to update Redux state
      return serverResponse;
    } catch (error) {
      console.log("❌ Profile update failed:", error.message);
      return rejectWithValue(error.message || "Profile update failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isInitialized: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuthState: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update Profile Cases
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload; // Update user with new profile image
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Signup cases
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.isAuthenticated = false; // User must login after signup
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      })
      // CheckAuthState cases
      .addCase(checkAuthState.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthState.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        if (action.payload) {
          state.user = action.payload;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(checkAuthState.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetAuthState } = authSlice.actions;
export default authSlice.reducer;