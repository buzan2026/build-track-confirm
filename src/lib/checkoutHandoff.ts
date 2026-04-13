import type { LineItemRow, OrderRow, ShipmentRow } from "@/hooks/useOrders";

/** Même contrat que `cart-checkout/src/lib/postOrderHandoff.ts`. */
export type CheckoutHandoffPayloadV1 = {
  v: 1;
  order: OrderRow;
  lineItems: LineItemRow[];
  shipments: ShipmentRow[];
};

export const CHECKOUT_HANDOFF_HASH_PREFIX = "rexel-checkout-handoff=";
export const CHECKOUT_OPEN_PANEL_KEY = "rexel-post-order-open-panel";

let handoffOrders: OrderRow[] = [];
let handoffLineItems: LineItemRow[] = [];
const handoffDetailByOrderNumber = new Map<
  string,
  { order: OrderRow; lineItems: LineItemRow[]; shipments: ShipmentRow[] }
>();

function base64UrlToUtf8(s: string): string {
  let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function decodeCheckoutHandoffToken(token: string): CheckoutHandoffPayloadV1 | null {
  try {
    const raw = decodeURIComponent(token);
    const json = base64UrlToUtf8(raw);
    const data = JSON.parse(json) as CheckoutHandoffPayloadV1;
    if (data?.v !== 1 || !data.order?.order_number || !Array.isArray(data.lineItems)) return null;
    return data;
  } catch {
    return null;
  }
}

export function applyCheckoutHandoffPayload(p: CheckoutHandoffPayloadV1): void {
  handoffOrders = handoffOrders.filter((o) => o.order_number !== p.order.order_number);
  handoffOrders.unshift({ ...p.order });
  handoffLineItems = handoffLineItems.filter((l) => l.order_id !== p.order.id);
  handoffLineItems.push(...p.lineItems.map((l) => ({ ...l })));
  handoffDetailByOrderNumber.set(p.order.order_number, {
    order: { ...p.order },
    lineItems: p.lineItems.map((l) => ({ ...l })),
    shipments: p.shipments.map((s) => ({ ...s })),
  });
}

export function mergeHandoffOrders(remote: OrderRow[]): OrderRow[] {
  const nums = new Set(handoffOrders.map((o) => o.order_number));
  const rest = remote.filter((o) => !nums.has(o.order_number));
  return [...handoffOrders.map((o) => ({ ...o })), ...rest];
}

export function mergeHandoffLineItems(remote: LineItemRow[]): LineItemRow[] {
  const ids = new Set(handoffLineItems.map((l) => l.id));
  const rest = remote.filter((l) => !ids.has(l.id));
  return [...handoffLineItems.map((l) => ({ ...l })), ...rest];
}

export function getHandoffOrderDetail(orderNumber: string): {
  order: OrderRow;
  lineItems: LineItemRow[];
  shipments: ShipmentRow[];
} | null {
  const hit = handoffDetailByOrderNumber.get(orderNumber);
  if (!hit) return null;
  return {
    order: { ...hit.order },
    lineItems: hit.lineItems.map((l) => ({ ...l })),
    shipments: hit.shipments.map((s) => ({ ...s })),
  };
}

export function isHandoffOrderId(orderId: string): boolean {
  return orderId.startsWith("checkout-");
}

/**
 * Consomme le fragment #rexel-checkout-handoff=… (navigation depuis cart-checkout).
 */
export function consumeCheckoutHandoffFromLocation(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash.startsWith(CHECKOUT_HANDOFF_HASH_PREFIX)) return null;
  const token = hash.slice(CHECKOUT_HANDOFF_HASH_PREFIX.length);
  const payload = decodeCheckoutHandoffToken(token);
  if (!payload) return null;

  applyCheckoutHandoffPayload(payload);

  const { pathname, search } = window.location;
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  params.delete("fromCheckout");
  const q = params.toString();
  const cleanSearch = q ? `?${q}` : "";

  window.history.replaceState(null, "", `${pathname}${cleanSearch}`);
  sessionStorage.setItem(CHECKOUT_OPEN_PANEL_KEY, payload.order.order_number);
  return payload.order.order_number;
}
