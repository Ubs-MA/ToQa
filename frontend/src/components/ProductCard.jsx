import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { money, api } from "../api";
import { useAuth } from "../auth";

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const inStock = product.variants?.some((variant) => variant.stock > 0);
  const wish = async () => {
    if (!user) return window.location.assign("/login");
    await api(`/wishlist/${product._id}`, { method: "POST" });
  };
  return <article className="product-card">
    <Link to={`/products/${product.slug || product._id}`} className="product-image-wrap">
      <img src={product.images?.[0] || "https://placehold.co/800x1000/ede8df/30433b?text=ToQa"} alt={product.name} />
      <span className={inStock ? "stock-pill" : "stock-pill sold"}>{inStock ? "Available" : "Sold out"}</span>
    </Link>
    <div className="product-card-body">
      <div><p className="eyebrow">{product.category?.name || "ToQa edit"}</p><Link to={`/products/${product.slug || product._id}`}><h3>{product.name}</h3></Link><strong>{money(product.basePrice)}</strong></div>
      <button className="icon-btn" onClick={wish} aria-label="Add to wishlist"><Heart size={19} /></button>
    </div>
  </article>;
}
