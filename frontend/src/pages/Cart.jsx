import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, money } from "../api";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [coupon, setCoupon] = useState("");
  const [error, setError] = useState("");
  const load = () => {
    api("/cart")
      .then((data) => setCart(data.cart))
      .catch((e) => setError(e.message));
  };
  useEffect(() => {
    load();
  }, []);
  const change = async (variantId, quantity) => { if (quantity < 1) return; const data = await api(`/cart/items/${variantId}`, { method: "PATCH", body: JSON.stringify({ quantity }) }); setCart(data.cart); };
  const remove = async (variantId) => { const data = await api(`/cart/items/${variantId}`, { method: "DELETE" }); setCart(data.cart); };
  const apply = async () => { try { setError(""); const data = await api("/cart/coupon", { method: "POST", body: JSON.stringify({ code: coupon }) }); setCart(data.cart); } catch (e) { setError(e.message); } };
  if (!cart) return <div className="page-state">Preparing your bag…</div>;
  return <section className="cart-page"><div><p className="eyebrow">Your selection</p><h1>Shopping bag</h1>{!cart.items.length ? <div className="empty-card"><p>Your bag is waiting.</p><Link className="button dark" to="/">Browse the collection</Link></div> : cart.items.map((item) => <article className="cart-item" key={item.variant._id}><img src={item.product.images?.[0] || "https://placehold.co/200x240"}/><div><h3>{item.product.name}</h3><p>{item.variant.size} · {item.variant.color}</p><strong>{money(item.variant.price ?? item.product.basePrice)}</strong></div><div className="quantity"><button onClick={() => change(item.variant._id,item.quantity-1)}><Minus size={15}/></button><span>{item.quantity}</span><button onClick={() => change(item.variant._id,item.quantity+1)}><Plus size={15}/></button></div><button className="icon-btn" onClick={() => remove(item.variant._id)}><Trash2 size={18}/></button></article>)}</div>
    <aside className="summary"><h2>Order summary</h2><div><span>Subtotal</span><strong>{money(cart.subtotal)}</strong></div><div><span>Discount</span><strong>− {money(cart.discount)}</strong></div><div className="summary-total"><span>Total</span><strong>{money(cart.total)}</strong></div><div className="coupon-row"><input value={coupon} onChange={(e)=>setCoupon(e.target.value)} placeholder="Coupon code"/><button onClick={apply}>Apply</button></div>{error && <p className="form-error">{error}</p>}<Link className={`button dark full ${!cart.items.length ? "disabled" : ""}`} to={cart.items.length ? "/checkout" : "/cart"}>Continue to checkout</Link></aside>
  </section>;
}