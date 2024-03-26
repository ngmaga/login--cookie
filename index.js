const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(session({
    secret: '1!2@3#',
    resave: false,
    saveUninitialized: true
}));

const users = [
    { email: 'user1@example.com', password: 'password1', name: 'User 1' },
    { email: 'user2@example.com', password: 'password2', name: 'User 2' },
];

app.get('/', (req, res) => {
    res.render('index', { error: null });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        req.session.user = user;
        res.cookie('user', user, { maxAge: 3600000, httpOnly: true });
        res.render('welcome', { user });
    } else {
        res.render('index', { error: 'Credenciais inválidas. Tente novamente.' });
    }
});

app.get('/logout', (req, res) => {
  res.clearCookie('user');
  res.cookie('user', '', { maxAge: 0, httpOnly: true, expires: new Date(0) }); // Configura o cookie para expirar imediatamente
  req.session.destroy((err) => {
      if (err) {
          console.error("Erro ao destruir a sessão:", err);
      } else {
          console.log("Sessão destruída com sucesso.");
          res.redirect('/');
      }
  });
});

app.get('/users', (req, res) => {
    if (!req.session.user) {
        res.redirect('/');
    } else {
        res.render('users', { users });
    }
});

app.post('/deleteUser', (req, res) => {
    const { email } = req.body;
    const index = users.findIndex(u => u.email === email);
    if (index !== -1) {
        users.splice(index, 1);
    }
    res.redirect('/users');
});

app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

app.post('/register', (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword || password !== confirmPassword) {
        return res.render('register', { error: 'Por favor, preencha todos os campos corretamente.' });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.render('register', { error: 'Este e-mail já está cadastrado. Tente outro.' });
    }

    const newUser = { name, email, password };
    users.push(newUser);

    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
