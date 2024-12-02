// Element Selectors
const signUpButton = document.getElementById('signUpButton');
const signInButton = document.getElementById('signInButton');
const signInForm = document.getElementById('signIn');
const signUpForm = document.getElementById('signup');
const forgotPasswordButton = document.getElementById('forgotPasswordButton');
const backToSignInButton = document.getElementById('backToSignIn');
const recoverPasswordForm = document.getElementById('forgotPassword');

// Password Toggle Elements
const toggleRegisterPassword = document.getElementById('toggleRegisterPassword');
const registerPasswordInput = document.getElementById('rPassword');
const toggleLoginPassword = document.getElementById('toggleLoginPassword');
const loginPasswordInput = document.getElementById('password');

// Functions

// Toggle between Sign Up and Sign In forms
const showSignUpForm = () => {
    signInForm.style.display = "none";
    signUpForm.style.display = "block";
};

const showSignInForm = () => {
    signInForm.style.display = "block";
    signUpForm.style.display = "none";
};

// Toggle between text and password visibility
const togglePasswordVisibility = (input, toggleIcon) => {
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    toggleIcon.classList.toggle('fa-eye');
    toggleIcon.classList.toggle('fa-eye-slash');
};

// Navigate to Forgot Password form
const showForgotPasswordForm = () => {
    signInForm.style.display = "none";
    recoverPasswordForm.style.display = "block";
};

// Navigate back to Sign In form
const backToSignIn = () => {
    recoverPasswordForm.style.display = "none";
    signInForm.style.display = "block";
};


// Form toggling
if (signUpButton) signUpButton.addEventListener('click', showSignUpForm);
if (signInButton) signInButton.addEventListener('click', showSignInForm);

// Password visibility toggling
if (toggleRegisterPassword && registerPasswordInput) {
    toggleRegisterPassword.addEventListener('click', () => togglePasswordVisibility(registerPasswordInput, toggleRegisterPassword));
}

if (toggleLoginPassword && loginPasswordInput) {
    toggleLoginPassword.addEventListener('click', () => togglePasswordVisibility(loginPasswordInput, toggleLoginPassword));
}

// Forgot Password navigation
if (forgotPasswordButton) forgotPasswordButton.addEventListener('click', showForgotPasswordForm);
if (backToSignInButton) backToSignInButton.addEventListener('click', backToSignIn);


// Fungsi untuk menampilkan atau menyembunyikan sidebar di mobile
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('main');

// Menambahkan event listener untuk membuka dan menutup sidebar
menuToggle.addEventListener('click', function() {
    sidebar.classList.toggle('active');
});







