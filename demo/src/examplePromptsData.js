// A large collection of example monetary expressions showcasing numis capabilities
export const examplePrompts = [
  // Basic symbols
  "$100",
  "$19.99",
  "€50",
  "£75.50",
  "¥1000",

  // ISO codes
  "USD 250",
  "100 EUR",
  "GBP 20.50",
  "50 CAD",
  "AUD 99.95",

  // Worded numbers
  "one hundred dollars",
  "fifty euros",
  "twenty-five pounds",
  "five hundred yen",
  "three thousand dollars",

  // Slang terms
  "20 bucks",
  "fifty quid",
  "a fiver",
  "ten grand",
  "half a million bucks",

  // Numeric combos (k, m, b)
  "10k",
  "$5k",
  "2.5m dollars",
  "1.2 billion USD",
  "500k EUR",

  // Numbers with separators
  "1,234.56 USD",
  "$1,000,000",
  "€2.500,00",
  "£10,000.00",

  // Contextual phrases
  "The price is $49.99",
  "I paid about €200 for it",
  "That costs around £50",
  "My rent is $1,500 a month",
  "The budget is 2 million dollars",

  // Fractions and decimals
  "half a dollar",
  "a quarter",
  "75 cents",
  "$0.99",
  "a dollar fifty",

  // Compound expressions
  "5 dollars and 50 cents",
  "two pounds and 30 pence",
  "a dollar and 23 cents",

  // International formats
  "R$150",
  "CHF 200",
  "kr 500",
  "Rs 1000",
  "MX$250",

  // Realistic data examples
  "Invoice total: $1,234.56",
  "Balance: €500.00",
  "Payment received: £250",
  "Transaction: 99.99 USD",
  "Amount due: 750 CAD",
];

// Get n random unique examples from the list
export function getRandomExamples(count = 3) {
  const shuffled = [...examplePrompts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
