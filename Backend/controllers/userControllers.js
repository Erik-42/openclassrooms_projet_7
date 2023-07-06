const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const User = require('../models/userModel.js');

// Création user
exports.signup = (req, res, next) => {
    bcrypt
        .hash(req.body.password, 10)
        .then(hash => {
            const newUser = new User({
                email: req.body.email,
                password: hash
            });
            newUser
                .save()
                .then(() => res.status(201).json({ message: 'Utilisateur crée !' }))
                .catch(error => res.status(400).json({ error, message: 'Erreur inscription' }))
        })
        .catch(error => res.status(500).json({ error }))
}

// Connexion user
exports.login = (req, res, next) => {
    User
        .findOne({ email: req.body.email })
        .then(user => {
            if (user === null) {
                res.status(401).json({ message: 'paire identifiant/mot de passe incorrecte' });
            } else {
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if (!valid) {
                            res.status(401).json({ message: 'paire identifiant/mot de passe incorrect' })
                        } else {
                            res.status(200).json({
                                userId: user._id,
                                token: jwt.sign({ userId: user._id }, process.env.TOKEN, { expiresIn: '24h' })
                            })
                        }
                    })
            }
        })
        .catch(error => res.status(500).json({ error }))
}
