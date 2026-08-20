import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customer: { name: user?.name || "", phone: user?.phone || "", email: user?.email || "" },
    deliveryAddress: user?.address || "",
    governorate: user?.governorate || "",
    deliveryNotes: "",
    orderNotes: "",
    paymentMethod: "cash_on_delivery",
    paymentReference: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key, value) => setForm({ ...form, [key]: value });

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await api("/checkout", { method: "POST", body: JSON.stringify(form) });
      if (!data?.order?._id) throw new Error("Order was created, but its confirmation details were not returned.");
      navigate(`/order-success/${data.order._id}`, { state: { order: data.order } });
    } catch (err) {
      setError(err.message || "Your order could not be placed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="form-page">
      <form className="form-card wide" onSubmit={submit}>
        <p className="eyebrow">Almost yours</p>
        <h1>Delivery & payment</h1>
        <div className="form-grid">
          <label className="field">
            <span>Name</span>
            <input required value={form.customer.name} onChange={(e) => set("customer", { ...form.customer, name: e.target.value })} />
          </label>
          <label className="field">
            <span>Phone</span>
            <input required value={form.customer.phone} onChange={(e) => set("customer", { ...form.customer, phone: e.target.value })} />
          </label>
          <label className="field full-span">
            <span>Email</span>
            <input type="email" value={form.customer.email} onChange={(e) => set("customer", { ...form.customer, email: e.target.value })} />
          </label>
          <label className="field full-span">
            <span>Address</span>
            <textarea required value={form.deliveryAddress} onChange={(e) => set("deliveryAddress", e.target.value)} />
          </label>
          <label className="field">
            <span>Governorate</span>
            <input required value={form.governorate} onChange={(e) => set("governorate", e.target.value)} />
          </label>
          <label className="field">
            <span>Payment</span>
            <select value={form.paymentMethod} onChange={(e) => set("paymentMethod", e.target.value)}>
              <option value="cash_on_delivery">Cash on delivery</option>
              <option value="electronic_wallet">Electronic wallet</option>
            </select>
          </label>
          {form.paymentMethod === "electronic_wallet" && (
            <label className="field full-span">
              <span>Wallet reference</span>
              <input value={form.paymentReference} onChange={(e) => set("paymentReference", e.target.value)} />
            </label>
          )}
          <label className="field full-span">
            <span>Order notes</span>
            <textarea value={form.orderNotes} onChange={(e) => set("orderNotes", e.target.value)} />
          </label>
        </div>
        {error && <p className="form-error">{error}</p>}
        <button className="button dark full" disabled={busy}>{busy ? "Checking stock..." : "Place order"}</button>
      </form>
    </section>
  );
}
