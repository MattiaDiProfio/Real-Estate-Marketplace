/**
 * function rentPerRoom
 * generate rent per room per month between £100 and £300
 * with £25 increment between each value from the selection
 */
module.exports.rentPerRoom = (min=100, max=300, increment=25) => {
    const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    const numPossibleValues = Math.floor((max - min) / increment) + 1;
    const randomIndex = getRandomNumber(0, numPossibleValues - 1);
    const randomNumber = min + randomIndex * increment;
    return randomNumber;
}