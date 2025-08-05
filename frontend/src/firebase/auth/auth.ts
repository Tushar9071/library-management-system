import { Auth } from "firebase/auth";
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import toast from "react-hot-toast";

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export const signInWithGoogle = async (auth: Auth) => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const idToken = await user.getIdToken();

  const response = await fetch("/api/auth/google-login", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: user.email, token: idToken }),
      credentials: 'include'  // This is important for handling cookies
  });

  if (response.ok) {
      const userData = await response.json();
      
      // Store user data in localStorage
      localStorage.setItem('userData', JSON.stringify({
          id: userData.id,
          email: userData.email,
          role: userData.role
      }));
      
      toast.success('Google login successful!');
      window.location.href = "/dashboard";
  } else {
      const errorData = await response.json();
      toast.error(errorData.message || 'Google login failed');
      throw new Error(errorData.message || 'Google login failed');
  }
};

export const signInWithGithub = async (auth: Auth) => {
  const result = await signInWithPopup(auth, githubProvider);
  const user = result.user;

  const idToken = await user.getIdToken();

  const response = await fetch("/api/auth/github-login", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: user.email, token: idToken }),
      credentials: 'include'  // This is important for handling cookies
  });

  if (response.ok) {
      const userData = await response.json();
      
      // Store user data in localStorage
      localStorage.setItem('userData', JSON.stringify({
          id: userData.id,
          email: userData.email,
          role: userData.role
      }));
      
      toast.success('GitHub login successful!');
      window.location.href = "/dashboard";
  } else {
      const errorData = await response.json();
      toast.error(errorData.message || 'GitHub login failed');
      throw new Error(errorData.message || 'GitHub login failed');
  }
};
