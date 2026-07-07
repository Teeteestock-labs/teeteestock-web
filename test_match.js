const orders = [
    { type: 'buy', price: 99, amount: 1 },
    { type: 'buy', price: 98, amount: 2 },
    { type: 'buy', price: 97, amount: 3 },
    { type: 'buy', price: 96, amount: 4 },
    { type: 'buy', price: 95, amount: 5 },
    { type: 'sell', price: 101, amount: 1 },
    { type: 'sell', price: 102, amount: 2 },
    { type: 'sell', price: 103, amount: 3 },
    { type: 'sell', price: 104, amount: 4 },
    { type: 'sell', price: 105, amount: 5 },
    { type: 'sell', price: 95, amount: 1, isUser: true }
];

let bestPrice = 100;
let maxVolume = 0;
let bestImbalance = 0;

const prices = Array.from(new Set(orders.map(o => o.price))).sort((a, b) => a - b);
console.log("Prices:", prices);

for (const p of prices) {
    const cumBuy = orders.filter(o => o.type === 'buy' && o.price >= p).reduce((sum, o) => sum + o.amount, 0);
    const cumSell = orders.filter(o => o.type === 'sell' && o.price <= p).reduce((sum, o) => sum + o.amount, 0);
    const volume = Math.min(cumBuy, cumSell);
    const imbalance = cumBuy - cumSell;

    console.log(`p=${p}, cumBuy=${cumBuy}, cumSell=${cumSell}, vol=${volume}, imb=${imbalance}`);

    if (volume > maxVolume) {
        maxVolume = volume;
        bestPrice = p;
        bestImbalance = imbalance;
    } else if (volume === maxVolume && volume > 0) {
        if (imbalance > 0 && p > bestPrice) {
            bestPrice = p;
            bestImbalance = imbalance;
        } else if (imbalance < 0 && p < bestPrice) {
            bestPrice = p;
            bestImbalance = imbalance;
        } else if (imbalance === 0) {
            if (Math.abs(p - 100) < Math.abs(bestPrice - 100)) {
                bestPrice = p;
                bestImbalance = imbalance;
            }
        }
    }
}
console.log("Best Price:", bestPrice, "Max Volume:", maxVolume);
