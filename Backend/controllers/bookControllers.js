const Book = require('../models/bookModel.js');
const fs = require('fs');
const { calcAverageRating } = require("../utils/averageRating.js");

// Créer un livre
exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const newBook = new Book({
        ...bookObject,
        id: bookObject._id,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename
            }`,
    });
    newBook
        .save()
        .then(() => { res.status(201).json({ message: 'Livre enregistré ! ' }) })
        .catch((error) => { res.status(400).json({ error: `Une erreur est survenue.` }) });
};

// Voir tous les livres
exports.getAllBooks = (req, res, next) => {
    Book
        .find()
        .then((books) => res.status(200).json(books))
        .catch((error) => res.status(400).json({ error: `Une erreur est survenue. Impossible de trouver les livres.` }));
};
// Sélectionner un livre
exports.getOneBook = (req, res, next) => {
    Book
        .findOne({ _id: req.params.id })
        .then((book) => res.status(200).json(book))
        .catch((error) => res.status(404).json({ error: `impossible de trouver le livre.` }));
}
// Modifier un livre
exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename
            }`,
    } : { ...req.body };
    delete bookObject._userId;
    // Recherche le livre en fonction de l'id dans la base de données
    Book
        .findOne({ _id: req.params.id })
        .then((book) => {// Vérifie si user du livre correspond à celui qui fait la requête
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Modification non autorisée' });
            } else {// Modifie les données du livre dans la base de données
                Book
                    .updateOne(
                        { _id: req.params.id },
                        { ...bookObject, _id: req.params.id }
                    )
                    .then(() => res.status(200).json({ message: 'Livre modifié' }))
                    .catch((error) => res.status(401).json({ error: `Une erreur est survenue.` }));
            }
        })
        .catch((error) => res.status(400).json({ error }));
};

// Supprimer un livre
exports.deleteOneBook = (req, res, next) => {
    Book
        .findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Suppression non autorisée' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book
                        .deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Livre supprimé' }))
                        .catch((error) => res.status(401).json({ error }));
                });
            }
        })
        .catch((error) => res.status(500).json({ error }));
};

// VOTES //
// Ajouter une note à un livre
exports.createRatings = (req, res) => {
    const user = req.body.userId;

    // Vérifie l'utilisateur
    if (user !== req.auth.userId) {
        res.status(401).json({ error: "Non autorisé à ajouter une note." });
    } else {
        const bookId = req.params.id;

        // Trouver le livre à noter en fonction de son id
        Book
            .findOne({ _id: bookId })
            .then(book => {
                // Vérifier si l'utilisateur n'a pas déjà noté le livre
                if (book.ratings.find(rating => rating.userId === user)) {
                    res.status(401).json({ error: "Impossible de noter ce livre une deuxième fois." })
                } else {
                    // Définit la nouvelle note
                    const newRating = { userId: user, grade: req.body.rating, _id: req.body._id };
                    // Ajouter la note au tableau ratings
                    const updatedRatings = [...book.ratings, newRating];
                    // Calculer la note moyenne
                    const updatedAverageRating = calcAverageRating(updatedRatings);

                    // Actualise dans la base de données
                    Book
                        .findOneAndUpdate(
                            { _id: bookId, "ratings.userId": { $ne: user } },
                            { $push: { ratings: newRating }, averageRating: updatedAverageRating },
                            { new: true } // Renvoie le document à jour
                        )
                        .then(updatedBook => {
                            if (updatedBook) {
                                res.status(201).json(updatedBook);
                            } else {
                                res.status(401).json({ error: "Impossible de noter ce livre une deuxième fois." })
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(500).json({ error: `Une erreur est survenue.` });
                        });
                }
            })
            .catch(error => console.log(error));
    }
}

// Top 3 des livres
exports.bestRatings = (req, res) => {
    Book
        .find()
        .then((books) => {
            books.sort((a, b) => b.averageRating - a.averageRating);
            const top3Books = books.slice(0, 3);
            res.status(200).json(top3Books);
        })
        .catch((error) => res.status(400).json({ error: `Une erreur est survenue.` }));
};