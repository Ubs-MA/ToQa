import { Boxes, LayoutDashboard, Package, Palette, ReceiptText, Ruler, Star, Tags, TicketPercent, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { api, money } from "../api";

const tabs = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["products", "Products", Package],
  ["categories", "Categories", Tags],
  ["sizes", "Sizes", Ruler],
  ["colors", "Colors", Palette],
  ["inventory", "Inventory", Boxes],
  ["orders", "Orders", ReceiptText],
  ["coupons", "Coupons", TicketPercent],
  ["users", "Customers", Users],
  ["reviews", "Reviews", Star],
];

const endpoint = {
  products: "/admin/products?all=true&limit=100",
  categories: "/admin/categories?all=true",
  sizes: "/admin/sizes",
  colors: "/admin/colors",
  inventory: "/admin/inventory",
  orders: "/admin/orders?limit=100",
  coupons: "/admin/coupons",
  users: "/admin/users?limit=100",
  reviews: "/admin/reviews",
};

const creatable = ["products", "categories", "sizes", "colors", "coupons"];

const rowsFrom = (value, key) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.[key])) return value[key];
  return [];
};

export default function Admin() {
  const [tab, setTab] = useState("dashboard");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setData(null);
    setError("");
    setActionError("");
    try {
      setData(await api(tab === "dashboard" ? "/admin/dashboard" : endpoint[tab]));
    } catch (exception) {
      setError(exception.message);
    }
  };

  useEffect(() => {
    setCreating(false);
    load();
  }, [tab]);

  const request = async (path, method, body) => {
    try {
      setActionError("");
      await api(path, { method, body: body ? JSON.stringify(body) : undefined });
      setCreating(false);
      await load();
    } catch (exception) {
      setActionError(exception.message);
    }
  };

  const remove = (path) => window.confirm("Are you sure?") && request(path, "DELETE");
  const activeTab = tabs.find(([key]) => key === tab);

  return <section className="admin-shell">
    <aside className="admin-nav">
      <div><p className="eyebrow">Store office</p><h2>ToQa Admin</h2></div>
      {tabs.map(([key, label, Icon]) => <button key={key} onClick={() => setTab(key)} className={tab === key ? "active" : ""}><Icon size={18}/>{label}</button>)}
    </aside>
    <div className="admin-main">
      <div className="admin-title">
        <div><p className="eyebrow">Operations</p><h1>{activeTab[1]}</h1></div>
        <div className="admin-tools">
          {creatable.includes(tab) && <button className="button dark" onClick={() => setCreating(!creating)}>{creating ? "Close" : "Add new"}</button>}
          <button className="button outline" onClick={load}>Refresh</button>
        </div>
      </div>
      {creating && <CreateForm type={tab} onCreate={(path, body) => request(path, "POST", body)} onDone={async () => { setCreating(false); await load(); }} />}
      {actionError && <p className="form-error">{actionError}</p>}
      {error ? <div className="page-state error">{error}</div> : !data ? <div className="page-state">Loading live store data...</div> : <AdminContent tab={tab} data={data} request={request} remove={remove}/>}
    </div>
  </section>;
}

function CreateForm({ type, onCreate, onDone }) {
  const [form, setForm] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (type === "products") api("/admin/categories?all=true").then(setCategories).catch((exception) => setError(exception.message));
  }, [type]);

  const field = (name, label = name, inputType = "text") => <label className="field">
    <span>{label}</span>
    <input required={!["image", "hex"].includes(name)} type={inputType} value={form[name] || ""} onChange={(event) => setForm({ ...form, [name]: event.target.value })}/>
  </label>;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (type === "products") {
        let imageUrl = form.image || "";
        if (imageFile) {
          const upload = new FormData();
          upload.append("image", imageFile);
          imageUrl = (await api("/uploads/product-image", { method: "POST", body: upload })).url;
        }
        const product = await api("/admin/products", { method: "POST", body: JSON.stringify({ name: form.name, slug: form.slug, description: form.description, category: form.category, basePrice: Number(form.basePrice), images: imageUrl ? [imageUrl] : [] }) });
        await api(`/admin/products/${product._id}/variants`, { method: "POST", body: JSON.stringify({ size: form.size, color: form.color, sku: form.sku, price: Number(form.price || form.basePrice), stock: Number(form.stock) }) });
        return onDone();
      }
      if (type === "categories") return onCreate("/admin/categories", { ...form, isActive: true });
      if (type === "sizes") return onCreate("/admin/sizes", { name: form.name, sortOrder: Number(form.sortOrder || 0) });
      if (type === "colors") return onCreate("/admin/colors", { name: form.name, hex: form.hex || undefined });
      return onCreate("/admin/coupons", { code: form.code, type: form.type || "percentage", value: Number(form.value), expiresAt: form.expiresAt, usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined, minimumOrderAmount: Number(form.minimumOrderAmount || 0), isActive: true });
    } catch (exception) {
      setError(exception.message);
    } finally {
      setBusy(false);
    }
  };

  return <form className="admin-create" onSubmit={submit}>
    {type === "products" && <>{field("name")}{field("slug")}{field("description")}<label className="field"><span>category</span><select required value={form.category || ""} onChange={(event) => setForm({ ...form, category: event.target.value })}><option value="">Choose</option>{categories.map((category) => <option value={category._id} key={category._id}>{category.name}</option>)}</select></label>{field("basePrice", "base price", "number")}{field("image", "image URL (optional)")}<label className="field"><span>or upload image</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] || null)}/></label>{field("size")}{field("color")}{field("sku")}{field("stock", "opening stock", "number")}</>}
    {type === "categories" && <>{field("name")}{field("slug")}{field("description")}{field("image", "image URL")}</>}
    {type === "sizes" && <>{field("name")}{field("sortOrder", "sort order", "number")}</>}
    {type === "colors" && <>{field("name")}{field("hex", "hex colour")}</>}
    {type === "coupons" && <>{field("code")}<label className="field"><span>type</span><select required value={form.type || "percentage"} onChange={(event) => setForm({ ...form, type: event.target.value })}><option value="percentage">Percentage</option><option value="fixed">Fixed</option></select></label>{field("value", "discount value", "number")}{field("expiresAt", "expiration date", "date")}{field("usageLimit", "usage limit", "number")}{field("minimumOrderAmount", "minimum order", "number")}</>}
    {error && <p className="form-error full-span">{error}</p>}
    <button className="button dark" disabled={busy}>{busy ? "Saving" : `Create ${type.slice(0, -1)}`}</button>
  </form>;
}

function AdminContent({ tab, data, request, remove }) {
  const patch = (path, body) => request(path, "PATCH", body);
  if (tab === "dashboard") return <><div className="stat-grid"><Stat label="Orders" value={data.totalOrders}/><Stat label="Products" value={data.totalProducts}/><Stat label="Low stock" value={data.lowStockVariantCount}/><Stat label="Paid sales" value={money(data.totalSales)}/></div><Table rows={data.recentOrders} columns={["orderNumber", "customerName", "orderStatus", "paymentStatus", "total"]}/></>;
  if (tab === "products") return <Table rows={rowsFrom(data, "products")} columns={["name", "basePrice", "isActive", "createdAt"]} actions={(row) => <><button onClick={() => { const basePrice = prompt("Base price", row.basePrice); if (basePrice) patch(`/admin/products/${row._id}`, { basePrice: Number(basePrice) }); }}>Edit price</button><button onClick={() => remove(`/admin/products/${row._id}`)}>Deactivate</button></>}/>;
  if (tab === "categories") return <Table rows={rowsFrom(data)} columns={["name", "slug", "isActive"]} actions={(row) => <><button onClick={() => { const name = prompt("Category name", row.name); if (name) patch(`/admin/categories/${row._id}`, { name }); }}>Edit</button><button onClick={() => remove(`/admin/categories/${row._id}`)}>Deactivate</button></>}/>;
  if (tab === "sizes" || tab === "colors") return <Table rows={rowsFrom(data)} columns={tab === "sizes" ? ["name", "sortOrder", "isActive"] : ["name", "hex", "isActive"]} actions={(row) => <button onClick={() => remove(`/admin/${tab}/${row._id}`)}>Deactivate</button>}/>;
  if (tab === "inventory") return <Table rows={rowsFrom(data)} columns={["product", "sku", "size", "color", "stock", "isActive"]} actions={(row) => <button onClick={() => { const stock = prompt("New stock", row.stock); if (stock !== null) patch(`/admin/variants/${row._id}/stock`, { stock: Number(stock) }); }}>Set stock</button>}/>;
  if (tab === "orders") return <Table rows={rowsFrom(data, "orders")} columns={["orderNumber", "customer", "total", "orderStatus", "paymentStatus"]} actions={(row) => <><select value={row.orderStatus} onChange={(event) => patch(`/admin/orders/${row._id}/status`, { orderStatus: event.target.value })}>{["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((value) => <option key={value}>{value}</option>)}</select><select value={row.paymentStatus} onChange={(event) => patch(`/admin/orders/${row._id}/payment-status`, { paymentStatus: event.target.value })}>{["pending", "paid", "failed", "refunded"].map((value) => <option key={value}>{value}</option>)}</select></>}/>;
  if (tab === "coupons") return <Table rows={rowsFrom(data)} columns={["code", "type", "value", "usageCount", "expiresAt", "isActive"]} actions={(row) => <button onClick={() => remove(`/admin/coupons/${row._id}`)}>Deactivate</button>}/>;
  if (tab === "users") return <Table rows={rowsFrom(data, "users")} columns={["name", "email", "role", "isActive", "createdAt"]} actions={(row) => <button onClick={() => patch(`/admin/users/${row._id}/status`, { isActive: !row.isActive })}>{row.isActive ? "Disable" : "Enable"}</button>}/>;
  return <Table rows={rowsFrom(data)} columns={["user", "product", "rating", "comment", "createdAt"]} actions={(row) => <button onClick={() => remove(`/admin/reviews/${row._id}`)}>Delete</button>}/>;
}

function Stat({ label, value }) {
  return <article className="stat"><p>{label}</p><strong>{value}</strong></article>;
}

function Table({ rows = [], columns, actions }) {
  return <div className="table-wrap">
    <table><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}{actions && <th>Actions</th>}</tr></thead><tbody>{rows.map((row) => <tr key={row._id}>{columns.map((column) => <td key={column}>{display(row[column])}</td>)}{actions && <td className="table-actions">{actions(row)}</td>}</tr>)}</tbody></table>
    {!rows.length && <div className="empty-card">No records yet.</div>}
  </div>;
}

function display(value) {
  if (value === true) return "Yes";
  if (value === false) return "No";
  if (typeof value === "string" && /^\d{4}-\d{2}/.test(value)) return new Date(value).toLocaleDateString();
  if (value && typeof value === "object") return value.name || value.email || value.code || value.slug || value._id || "-";
  return value ?? "-";
}
