import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, money } from "../api";

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api(`/orders/${orderId}`);
        if (!active) return;
        if (!data) throw new Error("This order could not be found.");
        setOrder({ ...data, items: Array.isArray(data.items) ? data.items : [] });
      } catch (err) {
        if (active) {
          setOrder(null);
          setError(err.message || "This order could not be loaded.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [orderId]);

  if (loading) return <div className="page-state">Loading your order...</div>;
  if (error) return <div className="page-state error"><h1>Order unavailable</h1><p>{error}</p><Link className="button dark" to="/account">Back to account</Link></div>;
  if (!order) return <div className="page-state"><h1>Order unavailable</h1><p>This order does not exist anymore.</p><Link className="button dark" to="/account">Back to account</Link></div>;

  const cancel = async () => {
    try {
      const data = await api(`/orders/${orderId}/cancel`, { method: "PATCH" });
      if (!data) throw new Error("The order was cancelled, but updated details were not returned.");
      setOrder({ ...data, items: Array.isArray(data.items) ? data.items : [] });
      setNotice("Order cancelled and stock restored.");
    } catch (error) {
      setNotice(error.message || "This order could not be cancelled.");
    }
  };

  const stages = ["pending", "confirmed", "processing", "shipped", "delivered"];
  const current = stages.indexOf(order.orderStatus);

  return (
    <section className="order-details">
      <p className="eyebrow">Order {order.orderNumber}</p>
      <h1>Order details</h1>
      <div className="tracking">
        {stages.map((stage, index) => (
          <div className={index <= current ? "done" : ""} key={stage}>
            <span></span>
            <p>{stage}</p>
          </div>
        ))}
      </div>
      {order.items.length ? order.items.map((item) => (
        <article className="order-line" key={item.variant}>
          <div>
            <h3>{item.productName}</h3>
            <p>{item.size} / {item.color} / Qty {item.quantity}</p>
          </div>
          <strong>{money(item.unitPrice * item.quantity)}</strong>
        </article>
      )) : <div className="empty-card">No order items were found.</div>}
      <div className="order-total"><span>Total</span><strong>{money(order.total)}</strong></div>
      <p>Payment: {order.paymentMethod.replaceAll("_", " ")} / {order.paymentStatus}</p>
      {["pending", "confirmed"].includes(order.orderStatus) && <button className="button outline" onClick={cancel}>Cancel order</button>}
      {notice && <p className="notice">{notice}</p>}
    </section>
  );
}
