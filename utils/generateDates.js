module.exports.getRandomDate = () => {
    const currentDate = new Date();
    const futureDate = new Date(currentDate);
    const randomDaysToAdd = Math.floor(Math.random() * 60) + 1;
    futureDate.setDate(currentDate.getDate() + randomDaysToAdd);
    const day = String(futureDate.getDate()).padStart(2, '0');
    const month = String(futureDate.getMonth() + 1).padStart(2, '0');
    const year = futureDate.getFullYear();
    return `${day}/${month}/${year}`;
}
module.exports.generateAvailableViewings = () => {
    let randomUKDates = [];
    for (let i = 0; i < 10; i++) {
        const randomDate = getRandomDate();
        randomUKDates.push(randomDate);
    }
    return randomUKDates;
}
