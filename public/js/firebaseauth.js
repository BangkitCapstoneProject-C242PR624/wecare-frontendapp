import {
  initializeApp,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

import {
  getAuth,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

import {
  getFirestore,
  setDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// -----------------TODO 1 CONFIGURATION --------------------
// TODO: Replace this with your Firebase config
const firebaseConfig = {
  //replace api key here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore();
const googleProvider = new GoogleAuthProvider();

// -------------------- UTILITY FUNCTIONS --------------------

/**
 * Helper function to display messages dynamically in specific divs.
 * @param {string} message - Message text to display.
 * @param {string} divId - The ID of the div where the message should appear.
 */
function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  if (messageDiv) {
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;

    setTimeout(() => {
      messageDiv.style.opacity = 0;
    }, 5000); // Hide the message after 5 seconds
  }
}

/**
 * Get the current date and time formatted in UTC+8.
 * @returns {string} - Formatted date string.
 */
function getFormattedDate() {
  const now = new Date();
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Singapore",
  };
  return now.toLocaleString("en-GB", options);
}

// -------------------- AUTHENTICATION EVENTS --------------------

// Sign-Up Event
document.getElementById("submitSignUp")?.addEventListener("click", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name")?.value.trim();
  const phone = document.getElementById("phone")?.value.trim();
  const email = document.getElementById("rEmail")?.value.trim();
  const password = document.getElementById("rPassword")?.value;

  if (!name || !phone || !email || !password) {
    showMessage("All fields are required!", "signUpMessage");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const formattedDate = getFormattedDate();
    const userData = {
      name,
      phone,
      email,
      password,
      uid: user.uid,
      createdAt: formattedDate,
      lastLogin: formattedDate,
    };

    await setDoc(doc(db, "users", user.uid), userData);

    showMessage("Account created successfully!", "signUpMessage");
    window.location.href = "login";
  } catch (error) {
    const errorCode = error.code;
    const message = errorCode === "auth/email-already-in-use"
      ? "Email address already exists!"
      : "Unable to create user. Try again.";
    showMessage(message, "signUpMessage");
  }
});

// Sign-In Event
document.getElementById("submitSignIn")?.addEventListener("click", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value;

  if (!email || !password) {
    showMessage("Email and Password are required!", "signInMessage");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const idToken = await user.getIdToken();
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (response.ok) {
      showMessage("Login successful!", "signInMessage");
      localStorage.setItem("loggedInUserId", user.uid);

      const formattedDate = getFormattedDate();
      await updateDoc(doc(db, "users", user.uid), { lastLogin: formattedDate });

      window.location.href = "home";
    } else {
      showMessage("Login failed. Please try again.", "signInMessage");
    }
  } catch (error) {
    const errorCode = error.code;
    const message = (errorCode === "auth/wrong-password" || errorCode === "auth/user-not-found")
      ? "Incorrect email or password."
      : "Unable to login. Try again.";
    showMessage(message, "signInMessage");
  }
});

// Forgot Password Event
document.getElementById("submitForgotPassword")?.addEventListener("click", async (event) => {
  event.preventDefault();

  const forgotEmail = document.getElementById("forgotEmail")?.value.trim();

  if (!forgotEmail) {
    showMessage("Email is required!", "forgotPasswordMessage");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, forgotEmail);
    showMessage("Reset link sent to your email.", "forgotPasswordMessage");
  } catch (error) {
    const errorCode = error.code;
    const message = errorCode === "auth/user-not-found"
      ? "No account found with this email."
      : "Unable to send reset link. Try again.";
    showMessage(message, "forgotPasswordMessage");
  }
});

// Google Sign-In Event
document.querySelector(".google-btn")?.addEventListener("click", async (event) => {
  event.preventDefault();

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const idToken = await user.getIdToken();
    const formattedDate = getFormattedDate();
    const userData = {
      name: user.displayName,
      email: user.email,
      uid: user.uid,
      photoURL: user.photoURL,
      createdAt: formattedDate,
      lastLogin: formattedDate,
    };

    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (response.ok) {
      await setDoc(doc(db, "users", user.uid), userData, { merge: true });
      showMessage("Login with Google successful!", "signInMessage");
      localStorage.setItem("loggedInUserId", user.uid);
      window.location.href = "home";
    } else {
      showMessage("Unable to login with Google. Try again.", "signInMessage");
    }
  } catch (error) {
    showMessage("Unable to login with Google. Try again.", "signInMessage");
  }
});

// Sign-Out Event
document.getElementById("logoutBtn")?.addEventListener("click", (event) => {
  event.preventDefault();

  signOut(auth)
    .then(() => {
      localStorage.removeItem("loggedInUserId");
      localStorage.setItem("logoutMessage", "You have successfully logged out!");
      window.location.href = "login";
    })
    .catch((error) => {
      alert("Failed to log out. Please try again.");
    });
});

// -------------------- AUTH STATE CHANGE --------------------
onAuthStateChanged(auth, (user) => {
  console.log(user ? "User logged in:" : "No user signed in.", user);
});
