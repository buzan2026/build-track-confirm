import { create } from "zustand";
import { orders as initialOrders, Order } from "@/data/demoOrders";

interface OrderStore {
  orders: Order[];
  markDelivered: (orderId: string) => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: initialOrders.map((o) => ({ ...o })),
  markDelivered: (orderId) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? { ...o, status: "delivered", deliveryStep: 3 }
          : o
      ),
    })),
}));
