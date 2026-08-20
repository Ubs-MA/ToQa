import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, money } from "../api";

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [notice, setNotice] = useState("");
  useEffect(() => { api(`/orders/${orderId}`).then(setOrder); }, [orderId]);
  if (!order) return <div className="page-state">Loading your order…</div>;
  const cancel = async () => { try { setOrder(await api(`/orders/${orderId}/cancel`, { method: "PATCH" })); setNotice("Order cancelled and stock restored."); } catch (error) { setNotice(error.message); } };
  const stages = ["pending", "confirmed", "processing", "shipped", "delivered"];
  const current = stages.indexOf(order.orderStatus);
  return <section className="order-details"><p className="eyebrow">Order {order.orderNumber}</p><h1>Order details</h1><div className="tracking">{stages.map((stage,index)=><div className={index<=current?"done":""} key={stage}><span></span><p>{stage}</p></div>)}</div>{order.items.map(item=><article className="order-line" key={item.variant}><div><h3>{item.productName}</h3><p>{item.size} · {item.color} · Qty {item.quantity}</p></div><strong>{money(item.unitPrice*item.quantity)}</strong></article>)}<div className="order-total"><span>Total</span><strong>{money(order.total)}</strong></div><p>Payment: {order.paymentMethod.replaceAll("_"," ")} · {order.paymentStatus}</p>{["pending","confirmed"].includes(order.orderStatus)&&<button className="button outline" onClick={cancel}>Cancel order</button>}{notice&&<p className="notice">{notice}</p>}</section>;
}
