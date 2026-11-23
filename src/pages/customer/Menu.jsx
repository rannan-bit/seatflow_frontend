import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Minus, Utensils } from "lucide-react";

import CustomerLayout from "../../components/CustomerLayout.jsx";
import { money } from "../../data/initialData.js";
import { getAllFoodsAPI } from "../../services/allAPI.js";
import FoodAssistant from "../../components/FoodAssistant.jsx";


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
  const isVegExplicit = food.isVeg !== undefined;
  const isVeg = isVegExplicit
    ? (food.isVeg === true || food.isVeg === "true")
    : !/chicken|mutton|fish|beef|prawn|meat|egg|pork|bacon|seafood/i.test(food.name || "");

  return {
    id: food._id,
    name: food.name,
    description: food.description,
    price: Number(food.price),
    category: food.category,
    image: food.image || "",
    imageUrl: foodImageUrl(food.image),
    available: food.available !== false,
    isVeg
  };
}

export default function Menu({ cart = {}, setCart, onFoodsLoaded }) {
  // 1. Customer details
  const [customer, setCustomer] = useState(null);

  // 2. Search state
  const [search, setSearch] = useState("");

  // 3. Selected category
  const [category, setCategory] = useState("Popular");

  // 4. Dietary section filter: All | Veg | Non-Veg
  const [dietFilter, setDietFilter] = useState("All");

  // 5. Food items from the backend
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get customer details from localStorage
  useEffect(() => {
    const storedCustomer = localStorage.getItem("seatflowCustomer");
    if (storedCustomer) {
      try {
        const customerData = JSON.parse(storedCustomer);
        setCustomer(customerData);
      } catch {
        // ignore malformed JSON
      }
    }
  }, []);

  // Fetch food items from MongoDB
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

  // Filter food items based on category and search
  const visibleFoods = foods.filter((food) => {
    const matchesCategory = food.category === category;
    const searchKey = search.toLowerCase().trim();

    const matchesSearch =
      !searchKey ||
      String(food.name || "").toLowerCase().includes(searchKey) ||
      String(food.description || "").toLowerCase().includes(searchKey);

    return matchesCategory && matchesSearch;
  });

  // Split into Vegetarian and Non-Vegetarian sections
  const vegFoods = visibleFoods.filter((food) => food.isVeg !== false);
  const nonVegFoods = visibleFoods.filter((food) => food.isVeg === false);

  // Add, increase and decrease food quantities
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

  // Calculate total number of food items
  const cartCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0
  );

  // Calculate total cart price
  const cartTotal = foods.reduce((total, food) => {
    const quantity = cart[food.id] || 0;
    return total + (food.price * quantity);
  }, 0);

  // Food card renderer
  const renderFoodCard = (food) => (
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
        <div className="food-name-row">
          <span
            className={`dietary-marker-icon ${food.isVeg ? "veg" : "non-veg"}`}
            title={food.isVeg ? "Vegetarian" : "Non-Vegetarian"}
          >
            <span className="dietary-marker-circle"></span>
          </span>
          <strong>{food.name}</strong>
        </div>

        <p>{food.description}</p>
        <b>{money(food.price)}</b>
      </div>

      {/* Quantity controls */}
      {(cart[food.id] || 0) > 0 ? (
        <div className="quantity-control">
          <button
            type="button"
            onClick={() => changeQuantity(food.id, -1)}
            aria-label="Decrease quantity"
          >
            <Minus size={12} />
          </button>
          <span>{cart[food.id]}</span>
          <button
            type="button"
            onClick={() => changeQuantity(food.id, 1)}
            disabled={!food.available}
            aria-label="Increase quantity"
          >
            <Plus size={12} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="add-button"
          onClick={() => changeQuantity(food.id, 1)}
          disabled={!food.available}
        >
          {food.available ? "Add +" : "Unavailable"}
        </button>
      )}
    </article>
  );

  return (
    <CustomerLayout active="Menu">

      <h1>Good food starts here.</h1>

      <p className="muted-text">
        {customer?.token ? `${customer.token} · ` : ""}
        {customer?.status ? `${customer.status} · ` : "Waiting for a table · "}
        Party of {customer?.guests || "—"}
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
            type="button"
            className={category === item ? "selected" : ""}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Dietary filter tabs (All / Vegetarian / Non-Vegetarian) */}
      <div className="diet-filter-chips">
        <button
          type="button"
          className={`diet-chip ${dietFilter === "All" ? "selected" : ""}`}
          onClick={() => setDietFilter("All")}
        >
          All ({visibleFoods.length})
        </button>
        <button
          type="button"
          className={`diet-chip veg-chip ${dietFilter === "Veg" ? "selected" : ""}`}
          onClick={() => setDietFilter("Veg")}
        >
          <span className="dietary-marker-circle veg"></span>
          Vegetarian ({vegFoods.length})
        </button>
        <button
          type="button"
          className={`diet-chip non-veg-chip ${dietFilter === "Non-Veg" ? "selected" : ""}`}
          onClick={() => setDietFilter("Non-Veg")}
        >
          <span className="dietary-marker-circle non-veg"></span>
          Non-Vegetarian ({nonVegFoods.length})
        </button>
      </div>

      {/* Food items content */}
      {loading ? (
        <p className="empty-state">Loading the menu…</p>
      ) : error ? (
        <div className="empty-state">
          <p className="form-error">{error}</p>
          <button type="button" className="button" onClick={loadFoods}>
            Try again
          </button>
        </div>
      ) : visibleFoods.length === 0 ? (
        <p className="empty-state">No dishes found in this category.</p>
      ) : (
        <div className="menu-sections-wrapper">
          {/* Vegetarian Section */}
          {dietFilter !== "Non-Veg" && (
            <section className="menu-dietary-section">
              <div className="section-heading">
                <div className="dietary-heading-title">
                  <span className="dietary-marker-icon veg">
                    <span className="dietary-marker-circle"></span>
                  </span>
                  <strong>Vegetarian</strong>
                </div>
                <small>{vegFoods.length} {vegFoods.length === 1 ? "dish" : "dishes"}</small>
              </div>

              {vegFoods.length > 0 ? (
                <div className="dietary-food-list">
                  {vegFoods.map(renderFoodCard)}
                </div>
              ) : (
                <p className="empty-substate">No vegetarian dishes in {category}.</p>
              )}
            </section>
          )}

          {/* Non-Vegetarian Section */}
          {dietFilter !== "Veg" && (
            <section className="menu-dietary-section">
              <div className="section-heading">
                <div className="dietary-heading-title">
                  <span className="dietary-marker-icon non-veg">
                    <span className="dietary-marker-circle"></span>
                  </span>
                  <strong>Non-Vegetarian</strong>
                </div>
                <small>{nonVegFoods.length} {nonVegFoods.length === 1 ? "dish" : "dishes"}</small>
              </div>

              {nonVegFoods.length > 0 ? (
                <div className="dietary-food-list">
                  {nonVegFoods.map(renderFoodCard)}
                </div>
              ) : (
                <p className="empty-substate">No non-vegetarian dishes in {category}.</p>
              )}
            </section>
          )}
        </div>
      )}

      {/* View cart button */}
      {cartCount > 0 && (
        <Link
          className="button full-width menu-cart-button"
          to="/customer/cart"
        >
          View Cart ({cartCount}) · {money(cartTotal)} →
        </Link>
      )}
      <FoodAssistant />
    </CustomerLayout>
  );
}
