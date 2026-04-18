import { create } from "zustand";
import type { Producto, PedidoItemConProducto, Mayorista, Cliente } from "@/lib/types";

const PEDIDO_KEY = "mayolista_pedido";

function savePedido(items: PedidoItemConProducto[], descuento: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PEDIDO_KEY, JSON.stringify({ items, descuento }));
  } catch { /* ignore */ }
}

function loadPedido(): { items: PedidoItemConProducto[]; descuento: number } {
  if (typeof window === "undefined") return { items: [], descuento: 0 };
  try {
    const raw = localStorage.getItem(PEDIDO_KEY);
    if (!raw) return { items: [], descuento: 0 };
    return JSON.parse(raw);
  } catch { return { items: [], descuento: 0 }; }
}

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

  // Pedido actual (persiste en localStorage)
  pedidoItems: PedidoItemConProducto[];
  descuentoGlobal: number;
  setDescuentoGlobal: (d: number) => void;
  addItem: (item: PedidoItemConProducto) => void;
  removeItem: (productoId: string) => void;
  updateItem: (productoId: string, updates: Partial<PedidoItemConProducto>) => void;
  clearPedido: () => void;
  getTotalPedido: () => number;
  restorePedido: () => void;
}

const saved = loadPedido();

export const useMayolistaStore = create<MayolistaState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),

  currentView: "login",
  setCurrentView: (view) => set({ currentView: view }),

  mayoristaActivo: null,
  setMayoristaActivo: (m) => {
    if (typeof window !== "undefined") {
      if (m) localStorage.setItem("mayolista_mayorista_id", m.id);
      else localStorage.removeItem("mayolista_mayorista_id");
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

  pedidoItems: saved.items,
  descuentoGlobal: saved.descuento,

  setDescuentoGlobal: (d) => {
    savePedido(get().pedidoItems, d);
    set({ descuentoGlobal: d });
  },
  addItem: (item) => {
    const { pedidoItems } = get();
    const existing = pedidoItems.find((i) => i.productoId === item.productoId);
    let next: PedidoItemConProducto[];
    if (existing) {
      next = pedidoItems.map((i) =>
        i.productoId === item.productoId
          ? { ...i, cantidad: i.cantidad + item.cantidad }
          : i
      );
    } else {
      next = [...pedidoItems, item];
    }
    savePedido(next, get().descuentoGlobal);
    set({ pedidoItems: next });
  },
  removeItem: (productoId) => {
    const next = get().pedidoItems.filter((i) => i.productoId !== productoId);
    savePedido(next, get().descuentoGlobal);
    set({ pedidoItems: next });
  },
  updateItem: (productoId, updates) => {
    const next = get().pedidoItems.map((i) =>
      i.productoId === productoId ? { ...i, ...updates } : i
    );
    savePedido(next, get().descuentoGlobal);
    set({ pedidoItems: next });
  },
  clearPedido: () => {
    if (typeof window !== "undefined") localStorage.removeItem(PEDIDO_KEY);
    set({ pedidoItems: [], descuentoGlobal: 0 });
  },
  getTotalPedido: () => {
    const { pedidoItems, descuentoGlobal } = get();
    const subtotal = pedidoItems.reduce((sum, item) => {
      const itemTotal = (item.cantidad + item.cantidadRegalo) * item.precioUnitario;
      const itemDiscount = itemTotal * (item.descuentoPct / 100);
      return sum + itemTotal - itemDiscount;
    }, 0);
    return subtotal * (1 - descuentoGlobal / 100);
  },
  restorePedido: () => {
    const { items, descuento } = loadPedido();
    set({ pedidoItems: items, descuentoGlobal: descuento });
  },
}));
