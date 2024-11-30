require('dotenv').config();

// ================== Import Modules ==================
const express = require('express');
const path = require('path');
const ejsLayouts = require('express-ejs-layouts');
const firebaseAdmin = require('firebase-admin');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');

// ================== Initialize App ==================
const app = express();

// ================== Middleware ==================
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ================== View Engine ==================
app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.set('views', path.join(__dirname, 'view'));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));
app.use(express.static(path.join(__dirname, 'public')));

// ================== Firebase Initialization ==================
const serviceAccount = require(process.env.FIREBASE_KEY_PATH);
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});
const db = firebaseAdmin.firestore();

// ================== Session Configuration ==================
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set secure: true in production
  })
);

// ================== Middleware Functions ==================
async function verifyIdToken(idToken) {
  try {
    return await firebaseAdmin.auth().verifyIdToken(idToken);
  } catch (error) {
    console.error('Error verifying ID token:', error.message);
    return null;
  }
}

const checkAuth = async (req, res, next) => {
  if (req.session.user) return next();
  res.redirect('/login');
};

// ================== Routes ==================

// Landing Page (Root)
app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/home');
  res.render('wecare', { title: 'WeCare', showLayout: false });
});

// Login Routes
app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/home');
  res.render('login', { title: 'Login', showLayout: false });
});

app.post('/login', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).send('No ID token provided');

  try {
    const decodedToken = await verifyIdToken(idToken);
    if (!decodedToken) return res.status(401).send('Unauthorized');

    req.session.user = { uid: decodedToken.uid, email: decodedToken.email };
    await db.collection('users').doc(decodedToken.uid).set(
      { lastLogin: new Date().toISOString(), uid: decodedToken.uid },
      { merge: true }
    );

    res.status(200).send('Login successful');
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).send('Failed to verify token');
  }
});

// Register Routes
app.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/home');
  res.render('register', { title: 'Register', showLayout: false });
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send('Email and password are required');

  try {
    const userRecord = await firebaseAdmin.auth().createUser({ email, password });
    req.session.user = { uid: userRecord.uid, email: userRecord.email };
    res.redirect('/home');
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).send('Registration failed');
  }
});

// Home Routes
app.get('/home', checkAuth, async (req, res) => {
  const userRef = db.collection('users').doc(req.session.user.uid);
  const userSnapshot = await userRef.get();
  if (userSnapshot.exists) {
    res.render('home', {
      title: 'Home',
      activePage: 'home',
      showLayout: true,
      user: userSnapshot.data(),
    });
  } else {
    res.redirect('/login');
  }
});

// ChatCare Routes
app.get('/chatcare', checkAuth, (req, res) => {
  res.render('chatbot', { title: 'Chat Care', activePage: 'chatcare', showLayout: true });
});

//Emergency Contact Routes
app.get('/emergency', checkAuth, (req, res) => {
  res.render('emergency', { title: 'Emergency Contact', activePage: 'emergency', showLayout: true });
});

//Profile Routes
app.get('/profile', checkAuth, async (req, res) => {
  const userRef = db.collection('users').doc(req.session.user.uid);
  const userSnapshot = await userRef.get();
  if (userSnapshot.exists) {
    res.render('profile', {
      title: 'Profile',
      activePage: 'profile',
      showLayout: true,
      user: userSnapshot.data(),
    });
  } else {
    res.redirect('/login');
  }
});

// Articles Routes
app.get('/article/:slug', checkAuth, (req, res) => {
  const articles = {
    choked: { title: 'Choked', content: '...', image: '/path/to/image' },
    infection: { title: 'Infection', content: '...', image: '/path/to/image' },
  };
  const article = articles[req.params.slug];
  if (article) {
    res.render('artikel', {
      title: article.title,
      article,
      activePage: 'home',
      showLayout: true,
    });
  } else {
    res.status(404).send('Article not found');
  }
});

// Logout Routes
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send('Error during session destruction');
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

// ================== Start Server ==================
app.listen(3005, () => {
  console.log('Server running on http://localhost:3005');
});
