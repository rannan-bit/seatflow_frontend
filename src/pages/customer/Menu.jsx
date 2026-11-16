import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Minus, Utensils } from "lucide-react";

import CustomerLayout from "../../components/CustomerLayout.jsx";
import { money } from "../../data/initialData.js";
import { getAllFoodsAPI } from "../../services/allAPI.js";

const categories = ["Popular", "Starters", "Mains", "Drinks"];

const API_ORIGIN = "http://localhost:3000";

function foodImageUrl(image) {
  if (!image) {
    return "";
  }
  if (/^https?:\/\//i.test(image)) {
    return image;
  }
  const cleanPath = String(image).replace(/^\/+/, "").replace(/^uploads\//, "");
  return `${API_ORIGIN}/uploads/${cleanPath.split("/").map(encodeURIComponent).join("/")}`;
}

// Convert a MongoDB document into the shape this page already uses
function mapFoodFromDB(food) {
  return {
    id: food._id,
    name: food.name,
    description: food.description,
    price: Number(food.price),
    category: food.category,
    image: food.image || "",
    imageUrl: foodImageUrl(food.image),
    available: food.available !== false
  };
}

export default function Menu({ cart = {}, setCart, onFoodsLoaded }) {

  // 1. Customer details
  const [customer, setCustomer] = useState(null);

  // 2. Search state
  const [search, setSearch] = useState("");

  // 3. Selected category
  const [category, setCategory] = useState("Popular");

  // 4. Food items from the backend
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // 5. Get customer details from localStorage
  useEffect(() => {

    const storedCustomer = localStorage.getItem("seatflowCustomer");

    if (storedCustomer) {
      const customerData = JSON.parse(storedCustomer);
      setCustomer(customerData);
    }

  }, []);


  // 6. Fetch food items from MongoDB
  async function loadFoods() {

    setLoading(true);
    setError("");

    const response = await getAllFoodsAPI();

    if (response?.status === 200 && Array.isArray(response.data)) {

      const mappedFoods = response.data.map(mapFoodFromDB);

      setFoods(mappedFoods);

      // Share the live menu with the rest of the app (e.g. the cart page)
      if (onFoodsLoaded) {
        onFoodsLoaded(mappedFoods);
      }

    } else {

      setError("We couldn't load the menu right now. Please try again.");

    }

    setLoading(false);

  }

  useEffect(() => {

    loadFoods();

  }, []);


  // 7. Filter food items based on category and search
  const visibleFoods = foods.filter((food) => {

    const matchesCategory = food.category === category;

    const searchKey = search.toLowerCase();

    const matchesSearch =
      String(food.name || "").toLowerCase().includes(searchKey) ||
      String(food.description || "").toLowerCase().includes(searchKey);

    return matchesCategory && matchesSearch;

  });


  // 8. Add, increase and decrease food quantities
  const changeQuantity = (foodId, change) => {

    setCart((prevCart) => {

      const currentQuantity = prevCart[foodId] || 0;

      const newQuantity = currentQuantity + change;

      // Remove food if quantity becomes zero
      if (newQuantity <= 0) {

        const updatedCart = { ...prevCart };

        delete updatedCart[foodId];

        return updatedCart;

      }

      // Update food quantity
      return {
        ...prevCart,
        [foodId]: newQuantity
      };

    });

  };


  // 9. Calculate total number of food items
  const cartCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0
  );


  // 10. Calculate total cart price
  const cartTotal = foods.reduce((total, food) => {

    const quantity = cart[food.id] || 0;

    return total + (food.price * quantity);

  }, 0);


  return (
    <CustomerLayout active="Menu">

      <h1>Good food starts here.</h1>

      <p className="muted-text">
        {customer?.token} · Waiting for a table · Party of {customer?.guests}
      </p>


      {/* Search */}
      <div className="search-box">

        <Search size={15} />

        <input
          placeholder="Search dishes, ingredients…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>


      {/* Categories */}
      <div className="category-chips">

        {categories.map((item) => (

          <button
            key={item}
            className={category === item ? "selected" : ""}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>

        ))}

      </div>


      {/* Food section heading */}
      <div className="section-heading">

        <strong>House favourites</strong>

        <small>● Vegetarian</small>

      </div>


      {/* Food items */}
      {loading ? (

        <p className="empty-state">Loading the menu…</p>

      ) : error ? (

        <div className="empty-state">

          <p className="form-error">{error}</p>

          <button className="button" onClick={loadFoods}>
            Try again
          </button>

        </div>

      ) : visibleFoods.length > 0 ? (

        visibleFoods.map((food) => (

          <article className="food-card" key={food.id}>

            <span className="food-emoji">
              <Utensils className="food-placeholder-icon" size={22} />
              {food.imageUrl && (
                <img
                  className="food-photo"
                  src={food.imageUrl}
                  alt={food.name}
                  loading="lazy"
                  onError={(event) => { event.currentTarget.style.display = "none"; }}
                />
              )}
            </span>


            <div className="food-details">

              <strong>{food.name}</strong>

              <p>{food.description}</p>

              <b>{money(food.price)}</b>

            </div>


            {/* Quantity controls */}
            {(cart[food.id] || 0) > 0 ? (

              <div className="quantity-control">

                <button onClick={() => changeQuantity(food.id, -1)}>
                  <Minus size={12} />
                </button>

                {cart[food.id]}

                <button
                  onClick={() => changeQuantity(food.id, 1)}
                  disabled={!food.available}
                >
                  <Plus size={12} />
                </button>

              </div>

            ) : (

              <button
                className="add-button"
                onClick={() => changeQuantity(food.id, 1)}
                disabled={!food.available}
              >
                {food.available ? "Add +" : "Unavailable"}
              </button>

            )}

          </article>

        ))

      ) : (

        <p>No food items found</p>

      )}


      {/* View cart button */}
      {cartCount > 0 && (

        <Link
          className="button full-width menu-cart-button"
          to="/customer/cart"
        >
          View Cart · {money(cartTotal)} →
        </Link>

      )}

    </CustomerLayout>
  );

}
