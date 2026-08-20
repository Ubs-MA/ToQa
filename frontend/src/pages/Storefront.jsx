import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api";
import ProductCard from "../components/ProductCard";

export default function Storefront() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ search: "", category: "", sort: "newest", size: "", color: "", availability: "", minPrice: "", maxPrice: "", page: 1 });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
      const data = await api(`/products?${params}`);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  useEffect(() => { api("/categories").then(setCategories).catch(() => {}); }, []);
  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer); }, [filters]);
  const update = (key, value) => setFilters({ ...filters, [key]: value, ...(key === "page" ? {} : { page: 1 }) });
  return <>
    <section className="hero">
      <div><p className="eyebrow">The new modest edit</p><h1>Quiet confidence,<br/><em>beautifully worn.</em></h1><p>Flowing silhouettes, soft structure, and considered details designed for the rhythm of real life.</p><a href="#collection" className="button dark">Explore the collection</a></div>
      <div className="hero-art"><div className="arch arch-one"></div><div className="arch arch-two"></div><span>TOQA<br/>ESSENTIALS</span></div>
    </section>
    <section className="collection" id="collection">
      <div className="section-heading"><div><p className="eyebrow">Shop the collection</p><h2>Made to move with you</h2></div><p>{pagination.total} considered pieces</p></div>
      <div className="filters">
        <label className="search"><Search size={18}/><input value={filters.search} onChange={(e) => update("search",e.target.value)} placeholder="Search the collection"/></label>
        <label><SlidersHorizontal size={17}/><select value={filters.category} onChange={(e) => update("category",e.target.value)}><option value="">All categories</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label>
        <select value={filters.sort} onChange={(e) => update("sort",e.target.value)}><option value="newest">Newest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="name">Name</option></select>
      </div>
      <div className="filter-more"><select value={filters.size} onChange={(e)=>update("size",e.target.value)}><option value="">Any size</option>{["S","M","L","XL","XXL"].map(size=><option key={size}>{size}</option>)}</select><input value={filters.color} onChange={(e)=>update("color",e.target.value)} placeholder="Colour"/><select value={filters.availability} onChange={(e)=>update("availability",e.target.value)}><option value="">Any availability</option><option value="in-stock">In stock</option><option value="out-of-stock">Out of stock</option></select><input type="number" min="0" value={filters.minPrice} onChange={(e)=>update("minPrice",e.target.value)} placeholder="Min price"/><input type="number" min="0" value={filters.maxPrice} onChange={(e)=>update("maxPrice",e.target.value)} placeholder="Max price"/></div>
      {loading ? <div className="page-state">Curating the collection…</div> : error ? <div className="page-state error">{error}</div> : products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product._id} product={product}/>)}</div> : <div className="page-state">No pieces match these filters.</div>}
      {pagination.pages>1&&<div className="pagination"><button disabled={pagination.page<=1} onClick={()=>update("page",pagination.page-1)}>Previous</button><span>Page {pagination.page} of {pagination.pages}</span><button disabled={pagination.page>=pagination.pages} onClick={()=>update("page",pagination.page+1)}>Next</button></div>}
    </section>
  </>;
}
