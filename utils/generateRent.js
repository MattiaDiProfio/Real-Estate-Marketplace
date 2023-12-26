// Generate a random monthly rent amount between 100, 125, 150 ... 300
module.exports.rentPerRoom = (min=100, max=300, increment=25) => {
    const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const numPossibleValues = Math.floor((max - min) / increment) + 1;
    const randomIndex = getRandomNumber(0, numPossibleValues - 1);
    const randomNumber = min + randomIndex * increment;
    return randomNumber;  
}