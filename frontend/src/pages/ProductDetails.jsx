import { Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api, money } from "../api";
import { useAuth } from "../auth";

export default function ProductDetails() {
  const { productId } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [variantId, setVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState("");
  useEffect(() => { api(`/products/${productId}`).then(async (data) => { setProduct(data); setVariantId(data.variants.find((v) => v.stock > 0)?._id || ""); setReviews(await api(`/products/${data._id}/reviews`)); }); }, [productId]);
  const variant = useMemo(() => product?.variants.find((item) => item._id === variantId), [product, variantId]);
  if (!product) return <div className="page-state">Loading the piece…</div>;
  const add = async () => { try { await api("/cart/items", { method: "POST", body: JSON.stringify({ variantId, quantity }) }); setNotice("Added to your bag."); } catch (error) { setNotice(error.message); } };
  const submitReview = async (event) => { event.preventDefault(); try { await api(`/products/${product._id}/reviews`, { method: "POST", body: JSON.stringify(review) }); setReview({ rating: 5, comment: "" }); setReviews(await api(`/products/${product._id}/reviews`)); } catch (error) { setNotice(error.message); } };
  return <section className="product-detail">
    <div className="detail-image"><img src={product.images?.[0] || "https://placehold.co/900x1100/ede8df/30433b?text=ToQa"} alt={product.name}/></div>
    <div className="detail-copy"><p className="eyebrow">{product.category?.name}</p><h1>{product.name}</h1><p className="detail-price">{money(variant?.price ?? product.basePrice)}</p><p className="description">{product.description}</p>
      <label className="field"><span>Size · colour</span><select value={variantId} onChange={(e) => setVariantId(e.target.value)}>{product.variants.map((item) => <option key={item._id} value={item._id} disabled={!item.stock}>{item.size} · {item.color} — {item.stock ? `${item.stock} available` : "Out of stock"}</option>)}</select></label>
      <div className="buy-row"><div className="quantity"><button onClick={() => setQuantity(Math.max(1, quantity-1))}><Minus size={16}/></button><span>{quantity}</span><button onClick={() => setQuantity(Math.min(variant?.stock || 1, quantity+1))}><Plus size={16}/></button></div><button className="button dark grow" disabled={!variantId} onClick={add}>Add to bag</button></div>
      {notice && <p className="notice">{notice}</p>}
      <div className="assurances"><p><Truck/> Delivery details confirmed at checkout</p><p><ShieldCheck/> Stock checked again before your order is placed</p></div>
      <section className="reviews"><h2>Customer notes</h2>{reviews.map((item) => <article key={item._id}><strong>{"★".repeat(item.rating)} · {item.user?.name || "Customer"}</strong><p>{item.comment}</p></article>)}{!reviews.length && <p>No reviews yet.</p>}{user && <form onSubmit={submitReview}><label className="field"><span>Rating</span><select value={review.rating} onChange={(e) => setReview({...review, rating:Number(e.target.value)})}>{[5,4,3,2,1].map(value => <option key={value} value={value}>{value} stars</option>)}</select></label><label className="field"><span>Your review</span><textarea required minLength="3" value={review.comment} onChange={(e) => setReview({...review, comment:e.target.value})}/></label><button className="button outline">Submit review</button></form>}</section>
    </div>
  </section>;
}
