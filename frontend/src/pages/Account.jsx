import { Heart, PackageCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, money } from "../api";
import { useAuth } from "../auth";

const tabs = [
  ["orders", "Orders", PackageCheck],
  ["wishlist", "Wishlist", Heart],
  ["profile", "Profile", UserRound],
];

export default function Account() {
  const { user, setUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTab = searchParams.get("tab");
  const initialTab = tabs.some(([key]) => key === queryTab) ? queryTab : "orders";
  const [tab, setTab] = useState(initialTab);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [form, setForm] = useState(user);
  const [notice, setNotice] = useState("");
  const [loadingTab, setLoadingTab] = useState(false);
  const [tabError, setTabError] = useState("");

  useEffect(() => {
    if (tabs.some(([key]) => key === queryTab) && queryTab !== tab) setTab(queryTab);
  }, [queryTab, tab]);

  const selectTab = (key) => {
    setTab(key);
    setSearchParams(key === "orders" ? {} : { tab: key });
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (tab === "profile") return;
      setLoadingTab(true);
      setTabError("");
      try {
        if (tab === "orders") {
          const data = await api("/orders");
          if (active) setOrders(Array.isArray(data.orders) ? data.orders : []);
        }
        if (tab === "wishlist") {
          const data = await api("/wishlist");
          if (active) setWishlist(Array.isArray(data.products) ? data.products : []);
        }
      } catch (error) {
        if (active) setTabError(error.message || "This section could not be loaded.");
      } finally {
        if (active) setLoadingTab(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [tab]);

  const save = async (event) => {
    event.preventDefault();
    try {
      setNotice("");
      const data = await api("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          address: form.address,
          governorate: form.governorate,
        }),
      });
      setUser(data);
      setForm(data);
      setNotice("Profile saved.");
    } catch (error) {
      setNotice(error.message || "Profile could not be saved.");
    }
  };

  const moveToCart = async (product) => {
    try {
      setNotice("");
      const detail = await api(`/products/${product._id}`);
      const variants = Array.isArray(detail.variants) ? detail.variants : [];
      const variant = variants.find((item) => item.stock > 0);
      if (!variant) return setNotice("This product is out of stock.");
      await api("/cart/items", { method: "POST", body: JSON.stringify({ variantId: variant._id, quantity: 1 }) });
      await api(`/wishlist/${product._id}`, { method: "DELETE" });
      setWishlist((items) => items.filter((item) => item._id !== product._id));
      setNotice("Moved to your bag.");
    } catch (error) {
      setNotice(error.message || "This product could not be moved.");
    }
  };

  return (
    <section className="account-page">
      <aside>
        <p className="eyebrow">Your ToQa</p>
        <h2>{user?.name || "Your account"}</h2>
        {tabs.map(([key, label, Icon]) => (
          <button className={tab === key ? "active" : ""} onClick={() => selectTab(key)} key={key}>
            <Icon size={17} /> {label}
          </button>
        ))}
      </aside>
      <div className="account-content">
        {notice && <p className="notice">{notice}</p>}
        {tabError && <div className="page-state error">{tabError}</div>}

        {tab === "orders" && (
          <>
            <h1>Order history</h1>
            {loadingTab ? <div className="page-state">Loading your orders...</div> : tabError ? null : orders.length ? orders.map((order) => (
              <Link className="order-card" to={`/orders/${order._id}`} key={order._id}>
                <div>
                  <strong>{order.orderNumber || "Order"}</strong>
                  <p>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Date unavailable"}</p>
                </div>
                <div>
                  <span className="status">{order.orderStatus || "pending"}</span>
                  <strong>{money(order.total)}</strong>
                </div>
              </Link>
            )) : <div className="empty-card">No orders yet.</div>}
          </>
        )}

        {tab === "wishlist" && (
          <>
            <h1>Wishlist</h1>
            {loadingTab ? <div className="page-state">Loading your wishlist...</div> : tabError ? null : wishlist.length ? (
              <div className="mini-grid">
                {wishlist.map((product) => (
                  <article key={product._id}>
                    <Link to={`/products/${product.slug || product._id}`}>
                      <img src={product.images?.[0] || "https://placehold.co/400x500"} alt={product.name || "Saved item"} />
                      <h3>{product.name || "Unavailable item"}</h3>
                      <p>{money(product.basePrice)}</p>
                    </Link>
                    <button className="button outline full" disabled={!product._id} onClick={() => moveToCart(product)}>Move to bag</button>
                  </article>
                ))}
              </div>
            ) : <div className="empty-card">No saved pieces yet.</div>}
          </>
        )}

        {tab === "profile" && (
          <form className="form-card flat" onSubmit={save}>
            <h1>Your details</h1>
            {["name", "phone", "address", "governorate"].map((key) => (
              <label className="field" key={key}>
                <span>{key}</span>
                <input value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </label>
            ))}
            <button className="button dark">Save changes</button>
          </form>
        )}
      </div>
    </section>
  );
}
