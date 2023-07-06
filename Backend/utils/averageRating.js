
// Fonction qui prend les votes en argument et retourne la moyenne avec 2 chiffres après la virgule
exports.calcAverageRating = (ratings) => {
    const sumRatings = ratings.reduce((total, rate) => total + rate.grade, 0);
    const average = sumRatings / ratings.length;
    return parseFloat(average.toFixed(2));
}