import express from 'express';
import passport from 'passport';
import User from '../dao/models/userModel.js';

const authRouter = express.Router();

authRouter.get('/login', (req, res) => {
  res.render('login'); // Renderiza la vista de login
});

authRouter.post('/register', async (req, res) => {
  try {
    const newUser = new User({ username: req.body.username, email: req.body.email });
    await User.register(newUser, req.body.password);
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
    res.redirect('/auth/login'); // Redirige a la página de login después del registro exitoso
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

authRouter.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/auth/login'); }
    
    // Autenticación exitosa
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      return res.json({ message: 'Login exitoso', user: req.user });
      // Puedes agregar una redirección si es necesario
    });
  })(req, res, next);
});

authRouter.get('/login-success', (req, res) => {
  res.redirect('/api/products');
});

authRouter.get('/logout', (req, res) => {
  req.logout();
  res.json({ message: 'Logout exitoso' });
  res.redirect('/auth/login'); // Redirige a la página de login después del logout exitoso
});

export function checkRole(role) {
  return (req, res, next) => {
    if (req.isAuthenticated() && req.user.roles === role) {
      return next();
    }
    res.status(403).json({ error: 'Acceso no autorizado' });
  };
}

export default authRouter;
