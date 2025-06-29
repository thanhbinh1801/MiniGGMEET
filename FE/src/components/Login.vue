<template>
  <div class="login-container">
    <h1 class="title">Welcome to MiniGGMEET</h1>
    <p class="subtitle">Sign in to continue</p>
    <button class="google-signin-button" @click="signInWithGoogle">
      <img src="https://www.shareicon.net/data/512x512/2016/11/22/854956_search_512x512.png" alt="Google Logo" class="google-logo" />
      Sign in with Google
    </button>
  </div>
</template>

<script> 
import { auth } from "@/firebase/config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import axios from "axios";

export default {
  name: "Login",
  methods: {
    async signInWithGoogle() {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken();

        const response = await axios.post("/api/v1/auth/firebase-login", {}, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        alert("Login Successful!");
        
        console.log("Server response:", response.data); // Debug
        console.log("User object to save:", response.data.metadata.user); // Debug
        
        localStorage.setItem("user", JSON.stringify(response.data.metadata.user));
        
        // Verify saved user
        const savedUser = localStorage.getItem("user");
        console.log("Saved user in localStorage:", savedUser); // Debug
        
        this.$router.push("/dashboard");
      } catch (error) {
        console.error("Error during Google login:", error);
        alert("Failed to sign in. Please try again.");
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f9f9f9;
  font-family: Arial, sans-serif;
}
</style>