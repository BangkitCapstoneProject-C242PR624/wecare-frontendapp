const express = require('express');
const path = require('path');
const ejsLayouts = require('express-ejs-layouts');
const app = express();

app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.set('views', path.join(__dirname, 'view'));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));

// root
app.get("/", (req, res) => {
    res.render("home", { activePage: "home", title: "Home" });
});

// Rute Home
app.get('/home', (req, res) => {
    res.render('home', { activePage: "home", title: "Home" });
});

// Rute Chat Care
app.get('/chatcare', (req, res) => {
    res.render('chatbot', { activePage: "chatbot", title: "Chat Care" });
});

// Rute Emergency Contact
app.get('/emergency', (req, res) => {
    res.render('emergency', { activePage: "emergency", title: "Emergency Contact" });
});

// rute artikel sementara
app.get('/article/:slug', (req, res) => {
    const slug = req.params.slug;

    const articles = {
        choked: {
            title: 'Choked',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
            image: '/path/to/choked/image.png',
        },
        infection: {
            title: 'Infection',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
            image: '/path/to/infection/image.png',
        }
    };

    const article = articles[slug];
    if (article) {
        res.render('artikel', {
            title: article.title,
            article: article,
            activePage: 'home' 
        });
    } else {
        res.status(404).send('Article not found');
    }
});


app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
