import { create } from "zustand";
import type { Producto, PedidoItemConProducto, Mayorista, Cliente } from "@/lib/types";

interface MayolistaState {
  // Auth
  user: any | null;
  setUser: (user: any | null) => void;

  // Navigation
  currentView: string;
  setCurrentView: (view: string) => void;

  // Mayorista activo
  mayoristaActivo: Mayorista | null;
  setMayoristaActivo: (m: Mayorista | null) => void;

  // Logo del comercio activo (base64, guardado en localStorage)
  logo: string | null;
  setLogo: (logo: string | null) => void;

  // Productos del mayorista activo (para búsqueda)
  productos: Producto[];
  setProductos: (p: Producto[]) => void;

  // Cliente activo
  clienteActivo: Cliente | null;
  setClienteActivo: (c: Cliente | null) => void;

  // Pedido actual
  pedidoItems: PedidoItemConProducto[];
  descuentoGlobal: number;
  setDescuentoGlobal: (d: number) => void;
  addItem: (item: PedidoItemConProducto) => void;
  removeItem: (productoId: string) => void;
  updateItem: (productoId: string, updates: Partial<PedidoItemConProducto>) => void;
  clearPedido: () => void;
  getTotalPedido: () => number;
}

export const useMayolistaStore = create<MayolistaState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),

  currentView: "login",
  setCurrentView: (view) => set({ currentView: view }),

  mayoristaActivo: null,
  setMayoristaActivo: (m) => {
    if (typeof window !== "undefined") {
      if (m) {
        localStorage.setItem("mayolista_mayorista_id", m.id);
      } else {
        localStorage.removeItem("mayolista_mayorista_id");
      }
    }
    set({ mayoristaActivo: m });
  },

  logo: null,
  setLogo: (logo) => {
    if (typeof window !== "undefined") {
      if (logo) localStorage.setItem("mayolista_logo", logo);
      else localStorage.removeItem("mayolista_logo");
    }
    set({ logo });
  },

  productos: [],
  setProductos: (p) => set({ productos: p }),

  clienteActivo: null,
  setClienteActivo: (c) => set({ clienteActivo: c }),

  pedidoItems: [],
  descuentoGlobal: 0,
  setDescuentoGlobal: (d) => set({ descuentoGlobal: d }),
  addItem: (item) => {
    const { pedidoItems } = get();
    const existing = pedidoItems.find((i) => i.productoId === item.productoId);
    if (existing) {
      set({
        pedidoItems: pedidoItems.map((i) =>
          i.productoId === item.productoId
            ? { ...i, cantidad: i.cantidad + item.cantidad }
            : i
        ),
      });
    } else {
      set({ pedidoItems: [...pedidoItems, item] });
    }
  },
  removeItem: (productoId) =>
    set({ pedidoItems: get().pedidoItems.filter((i) => i.productoId !== productoId) }),
  updateItem: (productoId, updates) =>
    set({
      pedidoItems: get().pedidoItems.map((i) =>
        i.productoId === productoId ? { ...i, ...updates } : i
      ),
    }),
  clearPedido: () => set({ pedidoItems: [], descuentoGlobal: 0 }),
  getTotalPedido: () => {
    const { pedidoItems, descuentoGlobal } = get();
    const subtotal = pedidoItems.reduce((sum, item) => {
      const itemTotal = (item.cantidad + item.cantidadRegalo) * item.precioUnitario;
      const itemDiscount = itemTotal * (item.descuentoPct / 100);
      return sum + itemTotal - itemDiscount;
    }, 0);
    return subtotal * (1 - descuentoGlobal / 100);
  },
}));
