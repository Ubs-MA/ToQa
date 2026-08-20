import { CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { money } from "../api";
export default function OrderSuccess(){const order=useLocation().state?.order;return <section className="success-page"><CheckCircle2/><p className="eyebrow">Order confirmed</p><h1>Thank you for choosing ToQa.</h1><p>{order?<>Your order <strong>{order.orderNumber}</strong> has been placed for {money(order.total)}.</>:"Your order has been placed successfully."}</p><Link className="button dark" to="/">Continue shopping</Link></section>}
