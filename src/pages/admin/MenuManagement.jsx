import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Pencil, X, RefreshCw, Search, Utensils } from "lucide-react";
import AdminLayout from "../../components/AdminLayout.jsx";
import { money } from "../../data/initialData.js";
import {
  getAllFoodsAPI,
  addFoodAPI,
  updateFoodAPI,
  deleteFoodAPI,
  changeFoodAvailabilityAPI
} from "../../services/allAPI.js";

const categories = ["Popular", "Starters", "Mains", "Drinks"];

const API_ORIGIN = "http://localhost:3000";

// The backend stores only the uploaded file name, so build the public URL.
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

function mapFoodFromDB(food) {
  return {
    id: food._id,
    name: food.name,
    description: food.description,
    price: Number(food.price),
    category: food.category,
    image: food.image || "",
    imageUrl: foodImageUrl(food.image),
    available: food.available !== false,
  };
}

function getErrorMessage(response, fallback) {
  const data = response?.response?.data ?? response?.data;
  if (typeof data === "string" && data.trim()) {
    return data;
  }
  return data?.message || fallback;
}

export default function MenuManagement() {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form doubles as "add dish" and "edit dish"
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Mains");
  const [available, setAvailable] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const [busyId, setBusyId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadFoods() {
      const response = await getAllFoodsAPI();

      if (!active) {
        return;
      }

      if (response?.status === 200 && Array.isArray(response.data)) {
        setFoods(response.data.map(mapFoodFromDB));
        setError("");
      } else {
        setError(getErrorMessage(response, "We couldn't load the menu. Please try again."));
      }

      setUnauthorized(response?.response?.status === 401);
      setLoading(false);
      setRefreshing(false);
    }

    loadFoods();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  function refresh() {
    setRefreshing(true);
    setActionError("");
    setRefreshKey((key) => key + 1);
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setCategory("Mains");
    setAvailable(true);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function startEditing(food) {
    setEditingId(food.id);
    setName(food.name);
    setDescription(food.description);
    setPrice(String(food.price));
    setCategory(food.category);
    setAvailable(food.available);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setActionError("");
    setSuccessMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveFood(event) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const numericPrice = Number(price);

    if (!trimmedName || !trimmedDescription || Number.isNaN(numericPrice) || numericPrice <= 0) {
      setActionError("Enter a dish name, a description and a price greater than zero.");
      return;
    }

    if (imageFile && !imageFile.type.startsWith("image/")) {
      setActionError("Please choose an image file (JPG, PNG, AVIF…).");
      return;
    }

    const formData = new FormData();
    formData.append("name", trimmedName);
    formData.append("description", trimmedDescription);
    formData.append("price", String(numericPrice));
    formData.append("category", category);
    formData.append("available", available ? "true" : "false");
    if (imageFile) {
      formData.append("image", imageFile);
    }

    setSubmitting(true);
    setActionError("");
    setSuccessMessage("");

    const response = editingId
      ? await updateFoodAPI(editingId, formData)
      : await addFoodAPI(formData);

    const success = editingId ? response?.status === 200 : response?.status === 201;

    if (success) {
      setSuccessMessage(response.data?.message || (editingId ? "Food updated successfully" : "Food added successfully"));
      resetForm();
      refresh();
    } else {
      setUnauthorized(response?.response?.status === 401);
      setActionError(getErrorMessage(
        response,
        editingId ? "Failed to update the dish. Please try again." : "Failed to add the dish. Please try again."
      ));
    }

    setSubmitting(false);
  }

  async function toggleAvailability(food) {
    setBusyId(food.id);
    setActionError("");
    setSuccessMessage("");

    const response = await changeFoodAvailabilityAPI(food.id, !food.available);

    if (response?.status === 200 && response.data?.food) {
      const updated = response.data.food;
      setFoods((items) => items.map((item) => (
        item.id === food.id ? { ...item, available: updated.available !== false } : item
      )));
      setSuccessMessage(`${food.name} is now ${updated.available ? "available" : "unavailable"}.`);
    } else {
      setUnauthorized(response?.response?.status === 401);
      setActionError(getErrorMessage(response, "Failed to change availability. Please try again."));
    }

    setBusyId(null);
  }

  async function removeFood(food) {
    if (deletingId) {
      return;
    }

    if (!window.confirm(`Remove "${food.name}" from the menu?`)) {
      return;
    }

    setDeletingId(food.id);
    setActionError("");
    setSuccessMessage("");

    const response = await deleteFoodAPI(food.id);

    if (response?.status === 200) {
      if (editingId === food.id) {
        resetForm();
      }
      setSuccessMessage(response.data?.message || "Food deleted successfully");
      refresh();
    } else {
      setUnauthorized(response?.response?.status === 401);
      setActionError(getErrorMessage(response, "Failed to delete the dish. Please try again."));
    }

    setDeletingId(null);
  }

  const searchKey = search.trim().toLowerCase();
  const visibleFoods = foods.filter((food) => (
    !searchKey
    || String(food.name || "").toLowerCase().includes(searchKey)
    || String(food.description || "").toLowerCase().includes(searchKey)
  ));

  const availableCount = foods.filter((food) => food.available).length;
  const editingFood = editingId ? foods.find((food) => food.id === editingId) : null;

  return (
    <AdminLayout role="Admin" title="Menu management">
      <h1>Menu management</h1>
      <p className="muted-text">
        {loading
          ? "Loading the menu…"
          : `${foods.length} ${foods.length === 1 ? "dish" : "dishes"} · ${availableCount} available · update prices, availability and photos.`}
      </p>

      {unauthorized && (
        <div className="info-box">
          <strong>Please sign in as an admin to manage the menu.</strong>
          <p><Link className="text-link" to="/admin-login">Go to admin login →</Link></p>
        </div>
      )}

      {editingId && (
        <p className="menu-edit-banner">
          Editing <strong>{editingFood?.name || "dish"}</strong> — change the details and save, or choose a new image to replace the current one.
        </p>
      )}

      <form className="panel form-row" onSubmit={saveFood}>
        <input
          placeholder="Name (e.g. Chicken Burger)"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <input
          placeholder="Description (e.g. Delicious chicken burger)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Price ₹ (e.g. 150)"
          value={price}
          min="0"
          step="any"
          onChange={(event) => setPrice(event.target.value)}
          required
        />
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={available ? "true" : "false"}
          onChange={(event) => setAvailable(event.target.value === "true")}
        >
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          aria-label="Dish image"
          onChange={(event) => setImageFile(event.target.files?.[0] || null)}
        />
        <button type="submit" className="button" disabled={submitting}>
          {submitting
            ? (editingId ? "Saving…" : "Adding…")
            : (editingId ? "Save changes" : "+ Add dish")}
        </button>
        {editingId && (
          <button type="button" className="button button-outline" onClick={resetForm} disabled={submitting}>
            <X size={14} /> Cancel
          </button>
        )}
      </form>

      {actionError && <p className="form-error">{actionError}</p>}
      {successMessage && <p className="form-success">{successMessage}</p>}
      {error && !actionError && <p className="form-error">{error}</p>}

      <section className="panel section-gap">
        <div className="queue-toolbar menu-toolbar">
          <div className="search-box queue-search">
            <Search size={15} />
            <input
              placeholder="Search dishes…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <button
            className="button button-outline"
            onClick={() => { setSuccessMessage(""); refresh(); }}
            disabled={refreshing || loading}
          >
            <RefreshCw size={14} /> {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p className="empty-state">Loading the menu…</p>
        ) : visibleFoods.length === 0 ? (
          <p className="empty-state">
            {foods.length === 0
              ? "No dishes yet. Add your first dish above."
              : "No dishes match your search."}
          </p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>DISH</th>
                  <th>CATEGORY</th>
                  <th>PRICE</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {visibleFoods.map((food) => (
                  <tr key={food.id}>
                    <td>
                      <div className="admin-food-name">
                        <span className="admin-food-thumb">
                          <Utensils size={16} />
                          {food.imageUrl && (
                            <img
                              src={food.imageUrl}
                              alt=""
                              loading="lazy"
                              onError={(event) => { event.currentTarget.style.display = "none"; }}
                            />
                          )}
                        </span>
                        <div>
                          <strong>{food.name}</strong>
                          <small>{food.description}</small>
                        </div>
                      </div>
                    </td>
                    <td>{food.category}</td>
                    <td>{money(food.price)}</td>
                    <td>
                      <button
                        type="button"
                        className={`status-pill ${food.available ? "available" : "occupied"}`}
                        onClick={() => toggleAvailability(food)}
                        disabled={busyId === food.id || deletingId === food.id}
                        title="Click to toggle availability"
                        style={{ border: "none", cursor: "pointer" }}
                      >
                        ● {busyId === food.id ? "Saving…" : food.available ? "Available" : "Unavailable"}
                      </button>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="button button-outline"
                          onClick={() => startEditing(food)}
                          disabled={submitting || deletingId === food.id}
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        <button
                          className="remove-button"
                          onClick={() => removeFood(food)}
                          disabled={deletingId === food.id}
                        >
                          <Trash2 size={14} /> {deletingId === food.id ? "Removing…" : "Remove"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
