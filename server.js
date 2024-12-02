/* eslint-disable no-undef */
require('dotenv').config();

// Import required modules
const express = require('express');
const path = require('path');
const ejsLayouts = require('express-ejs-layouts');
const firebaseAdmin = require('firebase-admin');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Initialize express app
const app = express();

// Middleware setup
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up view engine and layouts
app.set('view engine', 'ejs');
app.use(ejsLayouts);

// Static files setup
app.set('views', path.join(__dirname, 'view'));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));
app.use(express.static(path.join(__dirname, 'public')));

// Firebase Admin initialization
const serviceAccount = require(process.env.FIREBASE_KEY_PATH);
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});
const db = firebaseAdmin.firestore(); // Firestore initialization

// Middleware to verify Firebase ID token
async function verifyIdToken(idToken) {
  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error.message);
    return null;
  }
}

// Middleware to check authentication
const checkAuth = async (req, res, next) => {
  console.log(`Checking authentication for: ${req.path}`);
  const idToken = req.cookies['idToken'];

  if (idToken) {
    try {
      const decodedToken = await verifyIdToken(idToken);
      if (decodedToken) {
        req.user = decodedToken;
        console.log('User authenticated:', decodedToken.uid);
        return next();
      }
    } catch (error) {
      console.error('Invalid token detected:', error.message);
      res.clearCookie('idToken');
    }
  }
  console.log(`Redirecting to /login from: ${req.path}`);
  res.redirect('/login');
};

// Root
app.get('/', (req, res) => {
  const idToken = req.cookies['idToken'];
  if (idToken) {
    verifyIdToken(idToken).then((decodedToken) => {
      if (decodedToken) {
        res.redirect('/home');
      } else {
        res.clearCookie('idToken');
        res.render('wecare', { title: 'WeCare', showLayout: false });
      }
    });
  } else {
    res.render('wecare', { title: 'WeCare', showLayout: false });
  }
});

// Login route
app.get('/login', (req, res) => {
  const idToken = req.cookies['idToken'];
  if (idToken) {
    verifyIdToken(idToken).then((decodedToken) => {
      if (decodedToken) {
        res.redirect('/home');
      } else {
        res.clearCookie('idToken');
        res.render('login', { title: 'Login', showLayout: false });
      }
    });
  } else {
    res.render('login', { title: 'Login', showLayout: false });
  }
});

app.post('/login', (req, res) => {
  const idToken = req.body.idToken;
  if (idToken) {
    verifyIdToken(idToken).then((decodedToken) => {
      if (decodedToken) {
        res.cookie('idToken', idToken);
        res.redirect('/home');
      } else {
        res.status(401).send('Unauthorized');
      }
    });
  } else {
    res.status(400).send('No ID token provided');
  }
});

// Register route
app.get('/register', (req, res) => {
  const idToken = req.cookies['idToken'];
  if (idToken) {
    verifyIdToken(idToken).then((decodedToken) => {
      if (decodedToken) {
        res.redirect('/home');
      } else {
        res.clearCookie('idToken');
        res.render('register', { title: 'Register', showLayout: false });
      }
    });
  } else {
    res.render('register', { title: 'Register', showLayout: false });
  }
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.error('Register error: Missing email or password');
    return res.status(400).send('Email and password are required');
  }

  try {
    const userRecord = await firebaseAdmin.auth().createUser({
      email,
      password,
    });
    console.log('User registered:', userRecord.uid);

    const idToken = await firebaseAdmin.auth().createCustomToken(userRecord.uid);
    res.cookie('idToken', idToken);

    res.redirect('/home');
  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(500).send('Registration failed');
  }
});

// Home route (protected)
app.get('/home', checkAuth, async (req, res) => {
  try {
    const searchQuery = req.query.search || '';
    const userRef = db.collection('users').doc(req.user.uid);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      console.error('User not found in Firestore');
      res.redirect('/login');
      return;
    }

    const userData = userSnapshot.data();

    // Ambil semua data artikel dari Firestore
    const articlesSnapshot = await db.collection('articles').get();
    const articles = [];
    articlesSnapshot.forEach((doc) => {
      articles.push({ id: doc.id, ...doc.data() });
    });

    // Filter artikel yang sesuai dengan pencarian
    const filteredArticles = articles.filter((article) => {
      const title = article.title.toLowerCase();
      const searchLowerCase = searchQuery.toLowerCase();
      return title.includes(searchLowerCase);
    });

    // Render halaman home dengan hasil pencarian
    res.render('home', {
      title: 'Home',
      activePage: 'home',
      showLayout: true,
      articles: filteredArticles, 
      userName: userData.name, 
      searchQuery, 
    });
  } catch (error) {
    console.error('Error fetching data for home:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Chatcare route (protected)
app.get('/chatcare', checkAuth, (req, res) => {
  res.render('chatbot', { title: 'Chat Care', activePage: 'chatcare', showLayout: true });
});

// Emergency contact route (protected)
app.get('/emergency', checkAuth, (req, res) => {
  res.render('emergency', { title: 'Emergency Contact', activePage: 'emergency', showLayout: true });
});

// Profile route (protected)
app.get('/profile', checkAuth, async (req, res) => {
  const userRef = db.collection('users').doc(req.user.uid);
  const userSnapshot = await userRef.get();
  if (userSnapshot.exists) {
    const userData = userSnapshot.data();
    res.render('profile', {
      title: 'Profile',
      activePage: 'profile',
      showLayout: true,
      user: userData,
    });
  } else {
    console.log('Redirecting to /login from /profile - User not found');
    res.redirect('/login');
  }
});

// Article route (protected)
app.get('/article/:id', checkAuth, async (req, res) => {
  const articleId = req.params.id;

  try {
    const articleRef = db.collection('articles').doc(articleId);
    const articleSnapshot = await articleRef.get();

    if (articleSnapshot.exists) {
      const article = articleSnapshot.data();
      res.render('artikel', {
        title: article.title,
        article,
        activePage: 'home',
        showLayout: true,
      });
    } else {
      res.status(404).send('Article not found');
    }
  } catch (error) {
    console.error('Error fetching article:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  res.clearCookie('idToken');
  res.redirect('/');
});

// Start the server
app.listen(3005, () => {
  console.log('Server is running on http://localhost:3005');
});
