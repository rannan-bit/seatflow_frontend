import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout.jsx";
import {
  getAllOrdersAPI,
  updateOrderStatusAPI
} from "../../services/allAPI.js";

const STATUS_OPTIONS = {
  Pending: ["Preparing", "Cancelled"],
  Preparing: ["Ready", "Cancelled"],
  Ready: ["Served", "Cancelled"],
  Served: [],
  Cancelled: []
};

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch all orders
  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await getAllOrdersAPI();

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid order data received from server.");
      }

      setOrders(response.data);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  // Update order status
  async function changeStatus(orderId, newStatus) {
    try {
      setUpdatingId(orderId);
      setError("");
      setSuccess("");

      await updateOrderStatusAPI(orderId, {
        status: newStatus
      });

      setSuccess(`Order status updated to ${newStatus}.`);

      await loadOrders();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to update order status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // Update payment status
  async function changePaymentStatus(orderId, newStatus) {
    try {
      setUpdatingId(orderId);
      setError("");
      setSuccess("");

      await updateOrderStatusAPI(orderId, {
        paymentStatus: newStatus
      });

      setSuccess(`Payment status updated to ${newStatus}.`);

      await loadOrders();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to update payment status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <AdminLayout role="Admin" title="Order management">

      <h1>Order management</h1>

      <p className="muted-text">
        View customer orders and update their current status.
      </p>

      {error && (
        <p className="form-error">{error}</p>
      )}

      {success && (
        <p className="success-message">{success}</p>
      )}

      <section className="panel">

        <div className="table-scroll">

          <table>

            <thead>
              <tr>
                <th>ORDER</th>
                <th>CUSTOMER</th>
                <th>ITEMS</th>
                <th>TOTAL</th>
                <th>ORDER STATUS</th>
                <th>PAYMENT</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan="6">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6">No orders found.</td>
                </tr>
              ) : (

                orders.map((order) => {

                  const customer = order.queue;

                  const allowedStatuses =
                    STATUS_OPTIONS[order.status] || [];

                  return (
                    <tr key={order._id}>

                      {/* Order ID */}
                      <td>
                        {order._id.slice(-6).toUpperCase()}
                      </td>

                      {/* Customer details */}
                      <td>
                        <strong>
                          {customer?.customerName || "Unknown"}
                        </strong>

                        <br />

                        <small>
                          {customer?.phone || "N/A"}
                        </small>

                        <br />

                        <small>
                          Token: {customer?.token || "N/A"}
                        </small>
                      </td>

                      {/* Food items */}
                      <td>
                        {order.items?.map((item, index) => (
                          <div key={index}>
                            {item.food?.name || "Deleted food"} × {item.quantity}
                          </div>
                        ))}
                      </td>

                      {/* Total amount */}
                      <td>
                        ₹{Number(order.totalAmount).toFixed(2)}
                      </td>

                      {/* Order status */}
                      <td>
                        <select
                          value={order.status}
                          disabled={updatingId === order._id}
                          onChange={(event) =>
                            changeStatus(
                              order._id,
                              event.target.value
                            )
                          }
                        >
                          <option value={order.status}>
                            {order.status}
                          </option>

                          {allowedStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Payment status */}
                      <td>
                        <select
                          value={order.paymentStatus}
                          disabled={updatingId === order._id}
                          onChange={(event) =>
                            changePaymentStatus(
                              order._id,
                              event.target.value
                            )
                          }
                        >
                          <option value="Unpaid">Unpaid</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </section>

    </AdminLayout>
  );
}