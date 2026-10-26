export const initialFoods = [
  { id: 1, name: "Classic Margherita", description: "Tomato, basil and mozzarella", price: 349, category: "Popular", emoji: "🍕" },
  { id: 2, name: "Truffle Parmesan Fries", description: "Truffle oil, parmesan and herbs", price: 199, category: "Starters", emoji: "🍟" },
  { id: 3, name: "Creamy Rosé Penne", description: "Pink sauce, basil and parmesan", price: 329, category: "Mains", emoji: "🍝" },
  { id: 4, name: "Garden Fresh Salad", description: "Seasonal greens and lemon dressing", price: 249, category: "Starters", emoji: "🥗" },
  { id: 5, name: "Chocolate Lava Cake", description: "Warm chocolate cake", price: 179, category: "Drinks", emoji: "🍰" }
];

export const initialTables = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  capacity: index % 3 === 0 ? 6 : 4,
  status: [0, 2, 5, 8].includes(index)
    ? "Occupied"
    : index === 4
      ? "Reserved"
      : "Available"
}));

export const initialQueue = [
  { id: "A-024", name: "Aarav Shah", guests: 4, time: "12:42 PM", status: "Waiting" },
  { id: "A-025", name: "Maya Thomas", guests: 2, time: "12:46 PM", status: "Waiting" },
  { id: "A-026", name: "Adil Rahman", guests: 5, time: "12:49 PM", status: "Waiting" }
];

export const money = (amount) => `₹${Number(amount).toFixed(2)}`;
