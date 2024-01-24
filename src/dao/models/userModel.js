import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import passportLocalMongoose from 'passport-local-mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  // Otros campos del usuario
});

userSchema.plugin(passportLocalMongoose);

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Método estático para autenticar usuario
userSchema.statics.authenticate = async function(username, password, done) {
    const User = this;
  
    try {
      const user = await User.findOne({ username });
  
      if (!user) {
        return done(null, false, { message: 'Usuario no encontrado' });
      }
  
      const isMatch = await user.comparePassword(password);
  
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Contraseña incorrecta' });
      }
    } catch (err) {
      return done(err);  // Asegúrate de devolver done con el error en caso de excepción
    }
  };

  
userSchema.methods.serializeUser = function() {
  return {
    _id: this._id,
    username: this.username,
  };
};

const User = mongoose.model('User', userSchema);

export default User;
