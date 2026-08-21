import { Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api, money } from "../api";
import { useAuth } from "../auth";
import { useState } from "react";

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const inStock = product.variants?.some((variant) => variant.stock > 0);

  const wish = async () => {
    if (!user) return navigate("/login");
    if (!product._id || saving) return;
    try {
      setSaving(true);
      setNotice("");
      await api(`/wishlist/${product._id}`, { method: "POST" });
      setNotice("Saved");
    } catch (error) {
      setNotice(error.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="product-card">
      <Link to={`/products/${product.slug || product._id}`} className="product-image-wrap">
        <img src={product.images?.[0] || "https://placehold.co/800x1000/ede8df/30433b?text=ToQa"} alt={product.name} />
        <span className={inStock ? "stock-pill" : "stock-pill sold"}>{inStock ? "Available" : "Sold out"}</span>
      </Link>
      <div className="product-card-body">
        <div>
          <p className="eyebrow">{product.category?.name || "ToQa edit"}</p>
          <Link to={`/products/${product.slug || product._id}`}><h3>{product.name}</h3></Link>
          <strong className="price">{money(product.basePrice)}</strong>
        </div>
        <button className="icon-btn" disabled={saving || !product._id} onClick={wish} aria-label="Add to wishlist"><Heart size={19} /></button>
      </div>
      {notice && <p className="card-note">{notice}</p>}
    </article>
  );
}
