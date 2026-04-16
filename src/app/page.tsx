"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2,
  LogIn,
  ShoppingCart,
  Search,
  Plus,
  Users,
  History,
  LogOut,
  Upload,
  Trash2,
  Check,
  AlertCircle,
  Package,
  Truck,
  FileSpreadsheet,
  Send,
  Phone,
  MapPin,
  X,
  Menu,
  Store,
  ClipboardList,
  Mic,
  MicOff,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Pencil,
  Layers,
} from "lucide-react";
import { useMayolistaStore } from "@/lib/store";
import { toast } from "sonner";
import Fuse from "fuse.js";
import { track } from "@vercel/analytics";

// ==================== HELPERS ====================
function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  if (typeof window === "undefined") return { ...extra };
  const stored = localStorage.getItem("mayolista_user");
  const headers: Record<string, string> = { ...extra };
  if (stored) {
    try {
      const user = JSON.parse(stored);
      if (user?.id) headers["x-user-id"] = user.id;
    } catch { /* ignore */ }
  }
  return headers;
}

function normalizeText(t: string): string {
  return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function formatPrice(p: number): string {
  return p.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Parse quantity from query: "azúcar chango 400 unidades" -> { query: "azúcar chango", cantidad: 400 }
function parseQuantity(q: string): { cleanQuery: string; cantidad: number } {
  const qtyPattern = /\b(\d+)\s*(?:unidades?|unit|cajas?|bolsas?|packs?|kilos?|kgs?|kg|botellas?|latas?|docenas?)\b/i;
  const match = q.match(qtyPattern);
  if (match) {
    const cantidad = parseInt(match[1], 10);
    const cleanQuery = q.replace(qtyPattern, "").trim();
    return { cleanQuery, cantidad: cantidad > 0 ? cantidad : 1 };
  }
  const qtyPattern2 = /\b(\d+)\s*\w*$/;
  const match2 = q.match(qtyPattern2);
  if (match2 && parseInt(match2[1], 10) > 1) {
    const num = parseInt(match2[1], 10);
    if (num >= 2 && num <= 9999) {
      const cleanQuery = q.replace(qtyPattern2, "").trim();
      return { cleanQuery, cantidad: num };
    }
  }
  return { cleanQuery: q, cantidad: 1 };
}

// ==================== BACK BUTTON ====================
function BackButton({ to = "buscar", label = "Atrás" }: { to?: string; label?: string }) {
  const { setCurrentView } = useMayolistaStore();
  return (
    <button
      onClick={() => setCurrentView(to)}
      className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium mb-1"
    >
      <ChevronLeft className="w-4 h-4" />
      {label}
    </button>
  );
}

// ==================== LOGIN VIEW ====================
function LoginView() {
  const { setUser, setCurrentView, setMayoristaActivo, setProductos } = useMayolistaStore();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!nombre.trim() || !email.trim()) {
      setError("Completá tu nombre y email");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nombre.trim(), email: email.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("mayolista_user", JSON.stringify(data.user));
        setUser(data.user);
        track("login", { email: data.user.email });
        // Auto-cargar comercio y decidir a dónde ir
        try {
          const mRes = await fetch("/api/mayoristas", { headers: { "x-user-id": data.user.id } });
          if (mRes.ok) {
            const ms = await mRes.json();
            if (ms.length > 0) {
              setMayoristaActivo(ms[0]);
              const pRes = await fetch(`/api/productos?mayoristaId=${ms[0].id}`, { headers: { "x-user-id": data.user.id } });
              if (pRes.ok) setProductos(await pRes.json());
              setCurrentView("buscar");
            } else {
              setCurrentView("mayorista");
            }
          } else {
            setCurrentView("mayorista");
          }
        } catch {
          setCurrentView("mayorista");
        }
      } else {
        const body = await res.text().catch(() => "");
        setError(`Error al ingresar (${res.status})${body ? ": " + body : ""}`);
      }
    } catch (e: any) {
      setError("Sin conexión. Verificá tu internet e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-emerald-950 dark:via-gray-950 dark:to-emerald-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-200 dark:shadow-emerald-900/30 mb-4">
            <ClipboardList className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gradient">Mayolista-OK</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Tu lista de comercio, siempre lista
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-lg border p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <Store className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Ingresá con tu cuenta</h2>
              <p className="text-sm text-muted-foreground">Acceso rápido y seguro</p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Tu nombre</label>
              <input
                type="text"
                placeholder="Ej: Juan Pérez"
                value={nombre}
                onChange={(e) => { setNombre(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full px-4 py-3 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tu email</label>
              <input
                type="email"
                placeholder="Ej: juan@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full px-4 py-3 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-base shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Ingresando...</>
            ) : (
              <><LogIn className="w-5 h-5" /> Ingresar</>
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            100% gratis · Sin tarjeta de crédito
          </p>
        </div>
      </div>
    </div>
  );
}

// ==================== HEADER ====================
function AppHeader() {
  const { user, currentView, setCurrentView, mayoristaActivo, logo } = useMayolistaStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("mayolista_user");
    localStorage.removeItem("mayolista_mayorista_id");
    useMayolistaStore.getState().setUser(null);
  };

  const navItems = [
    { id: "buscar", label: "Buscar", icon: Search },
    { id: "pedido", label: "Pedido", icon: ShoppingCart },
    { id: "maestro", label: "Maestro", icon: Layers },
    { id: "mayorista", label: "Mi Lista", icon: Truck },
    { id: "clientes", label: "Clientes", icon: Users },
    { id: "historial", label: "Historial", icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => setCurrentView("buscar")}
          className="flex items-center gap-2.5"
        >
          {logo ? (
            <img src={logo} alt={mayoristaActivo?.nombre || "Logo"} className="w-8 h-8 rounded-lg object-cover shadow-md shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md shrink-0">
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
          )}
          <div className="text-left">
            {logo && mayoristaActivo ? (
              <>
                <h1 className="text-sm font-bold leading-tight">{mayoristaActivo.nombre}</h1>
                <p className="text-[10px] text-muted-foreground leading-tight">Mayolista-OK</p>
              </>
            ) : (
              <>
                <h1 className="text-sm font-bold leading-tight text-gradient">Mayolista-OK</h1>
                {mayoristaActivo && (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium leading-tight truncate max-w-[160px]">
                    {mayoristaActivo.nombre}
                  </p>
                )}
              </>
            )}
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                currentView === item.id
                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <span className="hidden sm:block text-xs font-medium text-muted-foreground mr-1">
            {user?.name}
          </span>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Salir"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t"
          >
            <nav className="max-w-4xl mx-auto px-4 py-3 grid grid-cols-3 gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setMenuOpen(false);
                  }}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium transition-all ${
                    currentView === item.id
                      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ==================== BOTTOM NAV ====================
function BottomNav() {
  const { currentView, setCurrentView } = useMayolistaStore();

  const items = [
    { id: "buscar", label: "Buscar", icon: Search },
    { id: "pedido", label: "Pedido", icon: ShoppingCart },
    { id: "maestro", label: "Maestro", icon: Layers },
    { id: "clientes", label: "Clientes", icon: Users },
    { id: "historial", label: "Historial", icon: History },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t bg-card/95 backdrop-blur-lg">
      <div className="grid grid-cols-5 h-16">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex flex-col items-center justify-center gap-0.5 transition-all ${
              currentView === item.id
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// ==================== DASHBOARD VIEW ====================
function DashboardView() {
  const { mayoristaActivo, setCurrentView, pedidoItems, productos } = useMayolistaStore();
  const pedidoCount = pedidoItems.length;
  const totalItems = productos.length;

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-6 text-white">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <h2 className="text-2xl font-bold">
            {mayoristaActivo ? mayoristaActivo.nombre : "¡Bienvenido!"}
          </h2>
          <p className="text-emerald-100 mt-1">
            {mayoristaActivo
              ? `${mayoristaActivo.rubro} · ${totalItems || mayoristaActivo._count?.productos || 0} productos cargados`
              : "Configurá tu comercio para empezar"}
          </p>
          {!mayoristaActivo && (
            <button
              onClick={() => setCurrentView("mayorista")}
              className="mt-4 px-6 py-3 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-colors flex items-center gap-2 shadow-lg text-base"
            >
              <Store className="w-5 h-5" />
              Configurar comercio
            </button>
          )}
        </div>
      </div>

      {!mayoristaActivo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 p-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">¿Primera vez acá?</h3>
          <p className="text-muted-foreground mb-6">
            Para empezar a armar pedidos, necesitás configurar tu primer comercio.
            Elegí un nombre, el rubro, y subí tu lista de precios.
          </p>
          <button
            onClick={() => setCurrentView("mayorista")}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-lg shadow-xl hover:from-emerald-600 hover:to-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Store className="w-6 h-6" />
            Configurar mi primer comercio
          </button>
          <p className="text-xs text-muted-foreground mt-4">
            Subí tu lista de precios en Excel o CSV · Lleva menos de 2 minutos
          </p>
        </motion.div>
      )}

      {mayoristaActivo && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setCurrentView("buscar")}
              className="p-5 rounded-xl border bg-card hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
            >
              <Package className="w-8 h-8 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-2xl font-bold">{totalItems || mayoristaActivo._count?.productos || 0}</p>
              <p className="text-sm text-muted-foreground">Productos</p>
            </button>
            <button
              onClick={() => setCurrentView("pedido")}
              className="p-5 rounded-xl border bg-card hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
            >
              <ShoppingCart className="w-8 h-8 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-2xl font-bold">{pedidoCount}</p>
              <p className="text-sm text-muted-foreground">En tu pedido</p>
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Acciones rápidas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setCurrentView("buscar")}
                className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex items-center justify-between flex-1">
                  <div>
                    <p className="font-medium text-sm">Buscar productos</p>
                    <p className="text-xs text-muted-foreground">Encontrá rápido lo que necesitás</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
              <button
                onClick={() => setCurrentView("pedido")}
                className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                  <ClipboardList className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex items-center justify-between flex-1">
                  <div>
                    <p className="font-medium text-sm">Ver pedido</p>
                    <p className="text-xs text-muted-foreground">Revisá y enviá tu lista</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
              <button
                onClick={() => setCurrentView("mayorista")}
                className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex items-center justify-between flex-1">
                  <div>
                    <p className="font-medium text-sm">Cambiar comercio</p>
                    <p className="text-xs text-muted-foreground">Cargá otra lista</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
              <button
                onClick={() => setCurrentView("clientes")}
                className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex items-center justify-between flex-1">
                  <div>
                    <p className="font-medium text-sm">Mis clientes</p>
                    <p className="text-xs text-muted-foreground">Gestioná tu cartera</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ==================== MAYORISTA VIEW ====================
function MayoristaView() {
  const { setMayoristaActivo, setCurrentView, setProductos, mayoristaActivo, logo, setLogo } = useMayolistaStore();
  const [nombre, setNombre] = useState("");
  const [rubro, setRubro] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [deletingComercio, setDeletingComercio] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { toast.error("El logo no puede superar 2MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setLogo(base64);
      toast.success("Logo guardado");
    };
    reader.readAsDataURL(f);
  };

  const handleDeleteComercio = async () => {
    if (!mayoristaActivo) return;
    if (!confirm(`¿Borrar el comercio "${mayoristaActivo.nombre}" y TODOS sus datos (productos, pedidos)? Esta acción no se puede deshacer.`)) return;
    setDeletingComercio(true);
    try {
      const res = await fetch(`/api/mayoristas?id=${mayoristaActivo.id}`, { method: "DELETE", headers: authHeaders() });
      if (res.ok) {
        setMayoristaActivo(null);
        setProductos([]);
        setLogo(null);
        toast.success("Comercio eliminado");
        setCurrentView("mayorista");
      } else {
        toast.error("Error al eliminar el comercio");
      }
    } catch { toast.error("Error de conexión"); }
    finally { setDeletingComercio(false); }
  };

  const rubros = [
    "Alimentos", "Bebidas", "Kiosco", "Limpieza", "Ferretería",
    "Tabacos", "Indumentaria", "Calzado", "Electrónica",
    "Pinturería", "Plomería", "Electricidad", "Otros",
  ];

  // Subir productos a un mayoristaId dado, devuelve la cantidad cargada
  const uploadProductsTo = async (mayoristaId: string): Promise<number> => {
    if (!file) return 0;
    setUploading(true);
    setUploadProgress("Leyendo archivo...");
    try {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as Record<string, any>[];
      if (rows.length === 0) { toast.error("El archivo está vacío"); return 0; }

      setUploadProgress(`Procesando ${rows.length} filas...`);
      const keys = Object.keys(rows[0]);
      const products: { codigo: string; descripcion: string; precio: number }[] = [];

      for (const raw of rows) {
        let descKey: string | null = null;
        let longestTextLen = 0;
        for (const k of keys) {
          const val = String(raw[k] || "").trim();
          if (val.length > longestTextLen && val.length > 3) { longestTextLen = val.length; descKey = k; }
        }
        const numericCols: { key: string; value: number; name: string }[] = [];
        for (const k of keys) {
          if (k === descKey) continue;
          if (typeof raw[k] === "number" && raw[k] > 0) numericCols.push({ key: k, value: raw[k], name: k.toLowerCase() });
        }
        let precioKey: string | null = null;
        for (const col of numericCols) {
          if (col.name.includes("$ unit") || col.name.includes("preciounitario")) { precioKey = col.key; break; }
        }
        let codigoKey: string | null = null;
        for (const col of numericCols) {
          if (col.key !== precioKey && !codigoKey) codigoKey = col.key;
        }
        const codigo = codigoKey ? String(raw[codigoKey] || "").trim() : "";
        const descripcion = descKey ? String(raw[descKey] || "").trim() : "";
        const precio = precioKey ? (Number(raw[precioKey]) || 0) : 0;
        if (!descripcion && !codigo) continue;
        if (!codigo && precio === 0 && descripcion.includes(";")) continue;
        products.push({ codigo, descripcion: descripcion || codigo, precio });
      }

      if (products.length === 0) { toast.error("No se encontraron productos en el archivo"); return 0; }

      const CHUNK_SIZE = 300;
      const totalChunks = Math.ceil(products.length / CHUNK_SIZE);
      let totalLoaded = 0;
      setUploadProgress(`Enviando lote 1 de ${totalChunks}...`);

      const firstRes = await fetch("/api/productos", {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ mayoristaId, productos: products.slice(0, CHUNK_SIZE), replace: true }),
      });
      if (!firstRes.ok) { toast.error("Error al subir lista"); return 0; }
      totalLoaded += Math.min(CHUNK_SIZE, products.length);
      setUploadProgress(`${totalLoaded} de ${products.length} productos...`);

      for (let i = 1; i < totalChunks; i++) {
        const chunk = products.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        setUploadProgress(`Enviando lote ${i + 1} de ${totalChunks}...`);
        const r = await fetch("/api/productos", {
          method: "POST",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ mayoristaId, productos: chunk, replace: false }),
        });
        if (!r.ok) break;
        totalLoaded += chunk.length;
        setUploadProgress(`${totalLoaded} de ${products.length} productos...`);
      }
      return totalLoaded;
    } catch (e) { console.error(e); toast.error("Error al procesar el archivo"); return 0; }
    finally { setUploading(false); setUploadProgress(""); }
  };

  // MODO CREAR: crear comercio (+ opcionalmente subir lista) y entrar
  const handleCreate = async () => {
    if (!nombre.trim() || !rubro) { toast.error("Completá el nombre y el rubro"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/mayoristas", {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ nombre: nombre.trim(), rubro }),
      });
      if (!res.ok) { toast.error("Error al crear comercio"); return; }
      const m = await res.json();
      let totalLoaded = 0;
      if (file) totalLoaded = await uploadProductsTo(m.id);
      setMayoristaActivo(m);
      if (totalLoaded > 0) {
        const pRes = await fetch(`/api/productos?mayoristaId=${m.id}`, { headers: authHeaders() });
        if (pRes.ok) setProductos(await pRes.json());
        toast.success(`Comercio creado con ${totalLoaded} productos`);
      } else {
        toast.success(`Comercio "${nombre.trim()}" creado`);
      }
      setCurrentView("buscar");
    } catch { toast.error("Error de conexión"); }
    finally { setLoading(false); }
  };

  // MODO EDITAR: reemplazar lista del comercio existente
  const handleUpdateList = async () => {
    if (!file || !mayoristaActivo) { toast.error("Elegí un archivo primero"); return; }
    const totalLoaded = await uploadProductsTo(mayoristaActivo.id);
    if (totalLoaded > 0) {
      const pRes = await fetch(`/api/productos?mayoristaId=${mayoristaActivo.id}`, { headers: authHeaders() });
      if (pRes.ok) setProductos(await pRes.json());
      setFile(null);
      toast.success(`${totalLoaded} productos actualizados`);
    }
  };

  const filePicker = (
    <div
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 ${
        file ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-muted-foreground/25"
      }`}
    >
      <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} className="hidden" />
      {file ? (
        <div className="space-y-2">
          <FileSpreadsheet className="w-10 h-10 text-emerald-500 mx-auto" />
          <p className="font-medium text-sm">{file.name}</p>
          <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
          <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-xs text-destructive hover:underline">Quitar archivo</button>
        </div>
      ) : (
        <div className="space-y-2">
          <Upload className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="font-medium text-sm">Tocá para elegir un archivo</p>
          <p className="text-xs text-muted-foreground">Excel (.xlsx, .xls) o CSV</p>
        </div>
      )}
    </div>
  );

  // ---- MODO EDITAR (ya tiene comercio) ----
  if (mayoristaActivo) {
    return (
      <div className="animate-fade-in-up space-y-6">
        <BackButton />
        <div>
          <h2 className="text-2xl font-bold">Mi Lista</h2>
          <p className="text-muted-foreground mt-1">Actualizá los precios o gestioná tus productos</p>
        </div>

        {/* Info comercio + Logo */}
        <div className="flex items-center gap-4 p-5 rounded-2xl border bg-card">
          <div
            onClick={() => logoInputRef.current?.click()}
            className="relative w-14 h-14 rounded-xl overflow-hidden cursor-pointer shrink-0 group"
            title="Tocá para cambiar el logo"
          >
            {logo ? (
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <Truck className="w-7 h-7 text-emerald-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 group-active:opacity-100 flex items-center justify-center transition-opacity">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg truncate">{mayoristaActivo.nombre}</p>
            <p className="text-sm text-muted-foreground">{mayoristaActivo.rubro} · {mayoristaActivo._count?.productos || 0} productos</p>
            <p className="text-xs text-emerald-600 mt-0.5">Tocá la imagen para subir logo</p>
          </div>
          {logo && (
            <button onClick={() => setLogo(null)} className="text-xs text-muted-foreground hover:text-destructive transition-colors shrink-0" title="Quitar logo">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="space-y-4 p-6 rounded-2xl border bg-card">
          <h3 className="font-semibold">Actualizar lista de precios</h3>
          <p className="text-sm text-muted-foreground">Subí un nuevo Excel para reemplazar todos los productos actuales.</p>
          {filePicker}
          {uploadProgress && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <Loader2 className="w-4 h-4 animate-spin" />{uploadProgress}
            </div>
          )}
          <button onClick={handleUpdateList} disabled={uploading || !file}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base">
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Upload className="w-5 h-5" /> Actualizar lista</>}
          </button>
        </div>

        <div className="p-4 rounded-2xl border border-destructive/30 bg-destructive/5">
          <div className="flex items-start gap-3">
            <Trash2 className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Borrar todos los productos</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Eliminá la lista para cargar una nueva desde cero</p>
              <button
                onClick={async () => {
                  if (!confirm(`¿Borrar todos los productos de ${mayoristaActivo.nombre}?`)) return;
                  try {
                    const res = await fetch(`/api/productos?mayoristaId=${mayoristaActivo.id}`, { method: "DELETE", headers: authHeaders() });
                    if (res.ok) { const data = await res.json(); setProductos([]); toast.success(`${data.deleted} productos eliminados`); }
                    else toast.error("Error al borrar");
                  } catch { toast.error("Error de conexión"); }
                }}
                className="mt-3 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors"
              >Borrar todo</button>
            </div>
          </div>
        </div>

        {/* Borrar el comercio completo */}
        <div className="p-4 rounded-2xl border border-destructive/50 bg-destructive/5">
          <div className="flex items-start gap-3">
            <Trash2 className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-destructive">Borrar este comercio</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Borra el comercio, todos sus productos y pedidos. Arrancás desde cero.</p>
              <button
                onClick={handleDeleteComercio}
                disabled={deletingComercio}
                className="mt-3 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deletingComercio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Borrar comercio completo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- MODO CREAR (primera vez, sin comercio) ----
  return (
    <div className="animate-fade-in-up space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configurar mi lista</h2>
        <p className="text-muted-foreground mt-1">Ingresá el nombre de tu comercio y subí tu lista de precios</p>
      </div>

      <div className="space-y-4 p-6 rounded-2xl border bg-card">
        <div>
          <label className="text-sm font-medium mb-1 block">Nombre del comercio</label>
          <input type="text" placeholder="Ej: Distribuidora Tomás"
            value={nombre} onChange={(e) => setNombre(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Rubro</label>
          <div className="flex flex-wrap gap-2">
            {rubros.map((r) => (
              <button key={r} onClick={() => setRubro(r)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  rubro === r
                    ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}>{r}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Logo (opcional) en modo crear */}
      <div className="p-5 rounded-2xl border bg-card space-y-3">
        <h3 className="font-semibold">
          Logo del comercio{" "}
          <span className="text-muted-foreground font-normal text-sm">(opcional)</span>
        </h3>
        <div className="flex items-center gap-4">
          <div
            onClick={() => logoInputRef.current?.click()}
            className="relative w-16 h-16 rounded-xl overflow-hidden cursor-pointer shrink-0 group border-2 border-dashed border-muted-foreground/25 hover:border-emerald-400 transition-colors"
          >
            {logo ? (
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </div>
          <div className="text-sm text-muted-foreground">
            {logo ? (
              <div className="space-y-1">
                <p className="text-emerald-600 font-medium">Logo cargado</p>
                <button onClick={() => setLogo(null)} className="text-xs text-destructive hover:underline">Quitar logo</button>
              </div>
            ) : (
              <p>Tocá para subir el logo de tu comercio. Aparecerá en el encabezado y en los PDFs.</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 p-6 rounded-2xl border bg-card">
        <h3 className="font-semibold">
          Lista de precios{" "}
          <span className="text-muted-foreground font-normal text-sm">(podés cargarla después)</span>
        </h3>
        {filePicker}
        {uploadProgress && (
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <Loader2 className="w-4 h-4 animate-spin" />{uploadProgress}
          </div>
        )}
      </div>

      <button onClick={handleCreate} disabled={loading || uploading || !nombre.trim() || !rubro}
        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base">
        {loading || uploading
          ? <Loader2 className="w-5 h-5 animate-spin" />
          : file
            ? <><Upload className="w-5 h-5" /> Crear y cargar lista</>
            : <><Plus className="w-5 h-5" /> Crear comercio</>
        }
      </button>
    </div>
  );
}

// ==================== BUSCAR VIEW ====================
function BuscarView() {
  const { mayoristaActivo, productos, setProductos, addItem, setCurrentView, pedidoItems } = useMayolistaStore();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [lastAdded, setLastAdded] = useState<{ nombre: string; cantidad: number } | null>(null);
  const [showAllBrowse, setShowAllBrowse] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Carga productos al activar el comercio
  useEffect(() => {
    async function load() {
      if (!mayoristaActivo?.id || productsLoaded) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/productos?mayoristaId=${mayoristaActivo.id}`, { headers: authHeaders() });
        if (res.ok) { setProductos(await res.json()); setProductsLoaded(true); }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    load();
  }, [mayoristaActivo?.id, productsLoaded, setProductos]);

  // Detectar cantidad en la búsqueda ("azúcar 400 unidades" → cantidad=400)
  const parsed = useMemo(() => parseQuantity(query.trim()), [query]);
  const cantidad = parsed.cantidad;

  // Fuse.js cargado una vez con los productos
  const fuse = useMemo(() => {
    if (!productos.length) return null;
    return new Fuse(productos, {
      keys: [{ name: "descripcion", weight: 0.75 }, { name: "codigo", weight: 0.25 }],
      threshold: 0.38, ignoreLocation: true, minMatchCharLength: 2, shouldSort: true,
    });
  }, [productos]);

  // Búsqueda en 3 niveles: exacto → parcial → fuzzy
  const resultados = useMemo(() => {
    const cleanQ = parsed.cleanQuery || query.trim();
    const nQ = normalizeText(cleanQ);
    if (nQ.length < 2 || !productos.length) return [];
    const palabras = nQ.split(/\s+/).filter((w) => w.length >= 2 && !/^\d+$/.test(w));
    if (!palabras.length) return [];

    const nivel1 = productos.filter((p) => {
      const d = normalizeText(p.descripcion || ""), c = normalizeText(p.codigo || "");
      return palabras.every((w) => d.includes(w) || c.includes(w));
    });
    if (nivel1.length >= 2) return nivel1.slice(0, 10);

    const nivel2 = productos.filter((p) => {
      const d = normalizeText(p.descripcion || ""), c = normalizeText(p.codigo || "");
      return palabras.some((w) => d.includes(w) || c.includes(w));
    });
    const fuzzy = fuse ? fuse.search(nQ, { limit: 10 }).map((r) => r.item) : [];

    const seen = new Set<string>(); const merged: typeof productos = [];
    for (const p of [...nivel1, ...nivel2, ...fuzzy]) {
      if (!seen.has(p.id)) { seen.add(p.id); merged.push(p); }
      if (merged.length >= 10) break;
    }
    return merged;
  }, [query, productos, fuse, parsed.cleanQuery]);

  const mejorResultado = resultados[0] ?? null;
  const alternativas = resultados.slice(1);

  // Agregar producto al pedido y volver a búsqueda para el siguiente
  const handleAgregar = useCallback((producto: typeof productos[0], qty: number) => {
    addItem({ cantidad: qty, cantidadRegalo: 0, precioUnitario: producto.precio, descuentoPct: 0, productoId: producto.id, producto });
    setLastAdded({ nombre: producto.descripcion, cantidad: qty });
    setQuery("");
    setTimeout(() => setLastAdded(null), 3000);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [addItem]);

  // Búsqueda por voz
  const toggleVoz = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Tu navegador no soporta búsqueda por voz"); return; }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const rec = new SR();
    rec.lang = "es-AR"; rec.continuous = false; rec.interimResults = true;
    let final = "";
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      setQuery(final + interim);
    };
    rec.onend = () => { setListening(false); if (final.trim()) setQuery(final); };
    rec.onerror = () => { setListening(false); toast.error("Error al escuchar. Intentá de nuevo."); };
    recognitionRef.current = rec; rec.start(); setListening(true);
  };

  if (!mayoristaActivo) {
    return (
      <div className="animate-fade-in-up text-center py-20">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
        <h3 className="text-xl font-semibold mb-2">Sin comercio activo</h3>
        <p className="text-muted-foreground mb-6">Primero cargá un comercio y su lista de precios</p>
        <button onClick={() => setCurrentView("mayorista")} className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors text-base">
          Ir a Comercios
        </button>
      </div>
    );
  }

  const browseLista = showAllBrowse ? productos : productos.slice(0, 60);

  return (
    <div className="animate-fade-in-up space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Hacer Pedido</h2>
          <p className="text-muted-foreground text-sm mt-0.5">{mayoristaActivo.nombre} · {loading ? "Cargando..." : `${productos.length} productos`}</p>
        </div>
        {pedidoItems.length > 0 && (
          <button onClick={() => setCurrentView("pedido")} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors">
            <ShoppingCart className="w-4 h-4" /> {pedidoItems.length}
          </button>
        )}
      </div>

      {/* Barra de búsqueda + voz */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder='Escribí o hablá: producto + cantidad (ej: "azúcar 400")'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-14 py-4 rounded-2xl border-2 bg-card text-foreground focus:outline-none focus:ring-0 focus:border-emerald-400 transition-all text-base"
          autoFocus
        />
        <button
          onClick={toggleVoz}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all ${listening ? "bg-red-100 dark:bg-red-900/40 text-red-600 animate-pulse" : "hover:bg-emerald-50 text-muted-foreground hover:text-emerald-600"}`}
          title={listening ? "Dejar de escuchar" : "Buscar por voz"}
        >
          {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
      </div>

      {/* Cantidad detectada */}
      {cantidad > 1 && query.trim().length >= 2 && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
          <Sparkles className="w-4 h-4 shrink-0" />
          Cantidad detectada: <strong>{cantidad} unidades</strong>
        </div>
      )}

      {/* Confirmación de último agregado */}
      <AnimatePresence>
        {lastAdded && (
          <motion.div key="added-banner" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 text-sm font-medium">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="truncate">{lastAdded.nombre}</span>
            <span className="shrink-0 font-bold">× {lastAdded.cantidad} agregado</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cargando */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Cargando lista de productos...</p>
        </div>
      )}

      {/* === RESULTADOS DE BÚSQUEDA === */}
      {!loading && query.trim().length >= 2 && (
        <div className="space-y-3">
          {resultados.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No encontramos ese producto</p>
              <p className="text-xs mt-1">Probá con otra palabra o revisá la escritura</p>
            </div>
          )}

          {/* Mejor resultado — card prominente */}
          {mejorResultado && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/25 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Mejor coincidencia</span>
              </div>
              {mejorResultado.codigo && (
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  {mejorResultado.codigo}
                </span>
              )}
              <p className="font-bold text-base leading-snug">{mejorResultado.descripcion}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Precio unitario: <span className="font-semibold text-foreground">${formatPrice(mejorResultado.precio)}</span></span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Total × {cantidad}: ${formatPrice(mejorResultado.precio * cantidad)}
                </span>
              </div>
              <button
                onClick={() => handleAgregar(mejorResultado, cantidad)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-base shadow-lg hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Agregar {cantidad} unidad{cantidad !== 1 ? "es" : ""} al pedido
              </button>
            </motion.div>
          )}

          {/* Alternativas */}
          {alternativas.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide pl-1">
                ¿No es ese? Otras opciones:
              </p>
              {alternativas.map((p) => (
                <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
                  <div className="flex-1 min-w-0">
                    {p.codigo && (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground mb-0.5">
                        {p.codigo}
                      </span>
                    )}
                    <p className="font-medium text-sm leading-snug truncate">{p.descripcion}</p>
                    <p className="text-xs text-muted-foreground">
                      ${formatPrice(p.precio)} c/u
                      {cantidad > 1 && <span className="text-emerald-600 dark:text-emerald-400 font-semibold ml-2">Total: ${formatPrice(p.precio * cantidad)}</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAgregar(p, cantidad)}
                    className="shrink-0 px-3 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-sm font-bold hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors"
                  >
                    + Agregar
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === LISTA COMPLETA (sin búsqueda) === */}
      {!loading && query.trim().length < 2 && (
        <div className="space-y-2">
          {productos.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay productos cargados para este comercio</p>
            </div>
          )}
          {browseLista.map((p) => (
            <button key={p.id} onClick={() => { setQuery(p.descripcion); setTimeout(() => inputRef.current?.focus(), 50); }}
              className="w-full text-left flex items-center gap-3 p-3 rounded-xl border bg-card hover:border-emerald-300 dark:hover:border-emerald-700 transition-all active:scale-[0.99]">
              <div className="flex-1 min-w-0">
                {p.codigo && <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground mb-0.5">{p.codigo}</span>}
                <p className="text-sm font-medium leading-snug truncate">{p.descripcion}</p>
              </div>
              <span className="shrink-0 font-bold text-emerald-600 dark:text-emerald-400 text-sm">${formatPrice(p.precio)}</span>
            </button>
          ))}
          {productos.length > 60 && (
            <button onClick={() => setShowAllBrowse((v) => !v)} className="w-full py-3 text-sm text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              {showAllBrowse ? "Mostrar menos" : `Ver los ${productos.length - 60} productos restantes`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ==================== PEDIDO VIEW ====================
function PedidoView() {
  const { pedidoItems, removeItem, updateItem, clearPedido, getTotalPedido, setCurrentView, mayoristaActivo, user, clienteActivo, descuentoGlobal, logo } = useMayolistaStore();
  const [sending, setSending] = useState(false);
  const [nombreCliente, setNombreCliente] = useState((clienteActivo as any)?.nombre || "");
  const [direccionCliente, setDireccionCliente] = useState((clienteActivo as any)?.direccion || "");
  const total = getTotalPedido();

  const handleConfirmar = async () => {
    if (!pedidoItems.length) { toast.error("El pedido está vacío"); return; }
    setSending(true);
    try {
      // Si hay nombre de cliente, buscar o crear el registro
      let clienteId: string | null = null;
      if (nombreCliente.trim()) {
        const cRes = await fetch("/api/clientes", { headers: authHeaders() });
        if (cRes.ok) {
          const lista = await cRes.json();
          const existente = lista.find((c: any) =>
            c.nombre.toLowerCase().trim() === nombreCliente.toLowerCase().trim()
          );
          if (existente) {
            clienteId = existente.id;
          } else {
            const cCreate = await fetch("/api/clientes", {
              method: "POST",
              headers: authHeaders({ "Content-Type": "application/json" }),
              body: JSON.stringify({ nombre: nombreCliente.trim(), direccion: direccionCliente.trim() || undefined }),
            });
            if (cCreate.ok) { const c = await cCreate.json(); clienteId = c.id; }
          }
        }
      }

      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          mayoristaId: mayoristaActivo?.id,
          clienteId,
          descuentoPct: descuentoGlobal,
          observaciones: direccionCliente.trim() || undefined,
          items: pedidoItems.map((i) => ({
            productoId: i.productoId, cantidad: i.cantidad,
            cantidadRegalo: i.cantidadRegalo, descuentoPct: i.descuentoPct, precioUnitario: i.precioUnitario,
          })),
        }),
      });
      if (res.ok) { toast.success("Pedido guardado"); track("pedido_confirmado", { comercio: mayoristaActivo?.nombre ?? "", items: pedidoItems.length, total: getTotalPedido() }); clearPedido(); setCurrentView("historial"); }
      else toast.error("Error al confirmar el pedido");
    } catch { toast.error("Error de conexión"); }
    finally { setSending(false); }
  };

  const handleWhatsApp = () => {
    if (!pedidoItems.length) return;
    const lineas = pedidoItems.map((i) => {
      const subtotal = i.precioUnitario * i.cantidad * (1 - i.descuentoPct / 100);
      const extras = [
        i.cantidadRegalo > 0 ? `+${i.cantidadRegalo} bonif.` : "",
        i.descuentoPct > 0 ? `${i.descuentoPct}% dto` : "",
      ].filter(Boolean).join(" · ");
      return `• [${i.producto.codigo || "---"}] ${i.producto.descripcion}\n  x${i.cantidad} × $${formatPrice(i.precioUnitario)} = $${formatPrice(subtotal)}${extras ? `  (${extras})` : ""}`;
    }).join("\n");
    const clienteLinea = nombreCliente ? `*Cliente: ${nombreCliente}*${direccionCliente ? `\n*Dirección: ${direccionCliente}*` : ""}\n` : "";
    const texto = `*PEDIDO — ${mayoristaActivo?.nombre || "Comercio"}*\n${clienteLinea}*Vendedor: ${(user as any)?.name || ""}*\n*Fecha: ${new Date().toLocaleDateString("es-AR")}*\n\n${lineas}\n\n*TOTAL: $${formatPrice(total)}*`;
    track("whatsapp_compartido", { comercio: mayoristaActivo?.nombre ?? "" });
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
  };

  const handleEmail = () => {
    if (!pedidoItems.length) return;
    const asunto = `Pedido ${mayoristaActivo?.nombre || "Comercio"}${nombreCliente ? ` — ${nombreCliente}` : ""} — ${new Date().toLocaleDateString("es-AR")}`;
    const clienteInfo = nombreCliente ? `Cliente: ${nombreCliente}${direccionCliente ? `\nDirección: ${direccionCliente}` : ""}\n` : "";
    const cuerpo = `${clienteInfo}Vendedor: ${(user as any)?.name || ""}\nFecha: ${new Date().toLocaleDateString("es-AR")}\n\n` +
      pedidoItems.map((i) => {
        const subtotal = i.precioUnitario * i.cantidad * (1 - i.descuentoPct / 100);
        return `${i.producto.codigo || ""} | ${i.producto.descripcion} | x${i.cantidad} | $${formatPrice(i.precioUnitario)} | $${formatPrice(subtotal)}`;
      }).join("\n") + `\n\nTOTAL: $${formatPrice(total)}`;
    window.open(`mailto:?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`);
  };

  const handlePDF = async () => {
    if (!pedidoItems.length) return;
    const fecha = new Date().toLocaleDateString("es-AR");
    const comercioNombre = mayoristaActivo?.nombre || "Comercio";
    const vendedorNombre = (user as any)?.name || "";
    const clienteNombre = nombreCliente;
    const clienteDireccion = direccionCliente;

    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // Membrete
    doc.setFillColor(5, 150, 105);
    doc.rect(0, 0, 210, 42, "F");
    doc.setTextColor(255, 255, 255);

    // Logo (si existe)
    const textStartX = logo ? 48 : 14;
    if (logo) {
      try { doc.addImage(logo, "PNG", 8, 5, 32, 32); } catch { /* ignore si el formato no es soportado */ }
    }

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(comercioNombre, textStartX, 14);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if (mayoristaActivo?.rubro) doc.text(mayoristaActivo.rubro, textStartX, 22);
    doc.text(`Vendedor: ${vendedorNombre}`, textStartX, 30);
    doc.text(`Fecha: ${fecha}`, textStartX, 37);
    if (clienteNombre) {
      doc.text(`Cliente: ${clienteNombre}`, 130, 30);
      if (clienteDireccion) doc.text(`Dir: ${clienteDireccion}`, 130, 37);
    }

    doc.setTextColor(0, 0, 0);

    // Tabla de productos
    const tableData = pedidoItems.map((i) => {
      const subtotal = i.precioUnitario * i.cantidad * (1 - i.descuentoPct / 100);
      const extras = [
        i.cantidadRegalo > 0 ? `+${i.cantidadRegalo} bon.` : "",
        i.descuentoPct > 0 ? `${i.descuentoPct}% dto` : "",
      ].filter(Boolean).join(" / ");
      return [
        i.producto.codigo || "—",
        i.producto.descripcion,
        String(i.cantidad),
        `$${formatPrice(i.precioUnitario)}`,
        extras || "—",
        `$${formatPrice(subtotal)}`,
      ];
    });

    autoTable(doc, {
      startY: 50,
      head: [["Código", "Descripción", "Cant.", "P. Unit.", "Bonif/Dto", "Subtotal"]],
      body: tableData,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 74 },
        2: { cellWidth: 14, halign: "center" },
        3: { cellWidth: 25, halign: "right" },
        4: { cellWidth: 28, halign: "center" },
        5: { cellWidth: 27, halign: "right", fontStyle: "bold", textColor: [5, 150, 105] },
      },
    });

    const finalY: number = (doc as any).lastAutoTable.finalY + 6;
    if (descuentoGlobal > 0) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Descuento global: ${descuentoGlobal}%`, 14, finalY);
    }
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(5, 150, 105);
    doc.text(`TOTAL: $${formatPrice(total)}`, 196, finalY + (descuentoGlobal > 0 ? 8 : 0), { align: "right" });

    const fileName = `pedido-${comercioNombre.replace(/\s+/g, "-")}-${fecha.replace(/\//g, "-")}.pdf`;

    // Compartir con Web Share API (mobile) o descargar
    if (typeof navigator !== "undefined" && navigator.share && typeof (navigator as any).canShare === "function") {
      const blob = doc.output("blob");
      const file = new File([blob], fileName, { type: "application/pdf" });
      if ((navigator as any).canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Pedido ${comercioNombre}`,
            text: `Pedido del ${fecha}${clienteNombre ? ` para ${clienteNombre}` : ""}`,
          });
          return;
        } catch (e: any) {
          if (e.name !== "AbortError") console.error(e);
        }
      }
    }
    track("pdf_generado", { comercio: mayoristaActivo?.nombre ?? "" });
    doc.save(fileName);
  };

  const handleExcelPedido = async () => {
    const XLSX = await import("xlsx");
    const fecha = new Date().toLocaleDateString("es-AR");
    const comercioNombre = mayoristaActivo?.nombre || "comercio";
    const clienteNombre = nombreCliente;
    const vendedorNombre = (user as any)?.name || "";

    // Encabezado informativo
    const info = [
      { "Código": "Comercio:", "Descripción": comercioNombre, "Cantidad": "", "Bonif. (unid.)": "", "Precio unitario": "", "Descuento %": "", "Subtotal": "" },
      { "Código": "Vendedor:", "Descripción": vendedorNombre, "Cantidad": "", "Bonif. (unid.)": "", "Precio unitario": "", "Descuento %": "", "Subtotal": "" },
      ...(clienteNombre ? [{ "Código": "Cliente:", "Descripción": clienteNombre, "Cantidad": "", "Bonif. (unid.)": "", "Precio unitario": "", "Descuento %": "", "Subtotal": "" }] : []),
      { "Código": "Fecha:", "Descripción": fecha, "Cantidad": "", "Bonif. (unid.)": "", "Precio unitario": "", "Descuento %": "", "Subtotal": "" },
      { "Código": "", "Descripción": "", "Cantidad": "", "Bonif. (unid.)": "", "Precio unitario": "", "Descuento %": "", "Subtotal": "" },
    ];
    const data = pedidoItems.map((i) => ({
      "Código": i.producto.codigo || "",
      "Descripción": i.producto.descripcion,
      "Cantidad": i.cantidad,
      "Bonif. (unid.)": i.cantidadRegalo,
      "Precio unitario": i.precioUnitario,
      "Descuento %": i.descuentoPct,
      "Subtotal": parseFloat((i.precioUnitario * i.cantidad * (1 - i.descuentoPct / 100)).toFixed(2)),
    }));
    data.push({ "Código": "", "Descripción": "TOTAL", "Cantidad": 0, "Bonif. (unid.)": 0, "Precio unitario": 0, "Descuento %": 0, "Subtotal": parseFloat(total.toFixed(2)) });

    const ws = XLSX.utils.json_to_sheet([...info, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pedido");

    const fileName = `pedido-${comercioNombre.replace(/\s+/g, "-")}-${fecha.replace(/\//g, "-")}.xlsx`;

    // Compartir con Web Share API (mobile) o descargar
    if (typeof navigator !== "undefined" && navigator.share && typeof (navigator as any).canShare === "function") {
      const wbOut = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbOut], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const file = new File([blob], fileName, { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      if ((navigator as any).canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: `Pedido ${comercioNombre}` });
          return;
        } catch (e: any) {
          if (e.name !== "AbortError") console.error(e);
        }
      }
    }
    track("excel_generado", { comercio: mayoristaActivo?.nombre ?? "" });
    XLSX.writeFile(wb, fileName);
  };

  if (!pedidoItems.length) {
    return (
      <div className="animate-fade-in-up space-y-4">
        <BackButton />
        <h2 className="text-2xl font-bold">Mi Pedido</h2>
        <div className="text-center py-16">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground">El pedido está vacío</p>
          <p className="text-xs text-muted-foreground mt-1">Buscá productos para armar tu pedido</p>
          <button onClick={() => setCurrentView("buscar")} className="mt-5 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors text-base">
            Buscar productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-4">
      <BackButton />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mi Pedido</h2>
          <p className="text-muted-foreground text-sm">{mayoristaActivo?.nombre} · {pedidoItems.length} ítems</p>
        </div>
        <button onClick={() => setCurrentView("buscar")} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors">
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </div>

      {/* Cliente */}
      <div className="p-4 rounded-2xl border bg-card space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-sm">Datos del cliente</span>
        </div>
        <input
          type="text"
          placeholder="Nombre o razón social *"
          value={nombreCliente}
          onChange={(e) => setNombreCliente(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="text"
          placeholder="Dirección (opcional)"
          value={direccionCliente}
          onChange={(e) => setDireccionCliente(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <p className="text-xs text-muted-foreground">Aparece en el PDF, WhatsApp y email del pedido</p>
      </div>

      {/* Tabla de ítems */}
      <div className="space-y-2 max-h-[calc(100vh-460px)] overflow-y-auto scrollbar-thin">
        {pedidoItems.map((item) => {
          const subtotal = item.precioUnitario * item.cantidad * (1 - item.descuentoPct / 100);
          return (
            <motion.div key={item.productoId} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="p-3 rounded-xl border bg-card">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  {item.producto.codigo && (
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground mb-0.5">{item.producto.codigo}</span>
                  )}
                  <p className="font-semibold text-sm leading-snug">{item.producto.descripcion}</p>
                </div>
                <button onClick={() => removeItem(item.productoId)} className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
                <span>P. unit: <b className="text-foreground">${formatPrice(item.precioUnitario)}</b></span>
                <span className="text-right">Subtotal: <b className="text-emerald-600 dark:text-emerald-400">${formatPrice(subtotal)}</b></span>
                {item.cantidadRegalo > 0 && <span className="text-emerald-600">+{item.cantidadRegalo} bonificación</span>}
                {item.descuentoPct > 0 && <span className="text-right text-emerald-600">{item.descuentoPct}% descuento</span>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateItem(item.productoId, { cantidad: Math.max(1, item.cantidad - 1) })}
                  className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-muted transition-colors font-bold text-base">−</button>
                <input type="number" value={item.cantidad}
                  onChange={(e) => updateItem(item.productoId, { cantidad: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-14 h-8 rounded-lg border bg-background text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <button onClick={() => updateItem(item.productoId, { cantidad: item.cantidad + 1 })}
                  className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-muted transition-colors font-bold text-base">+</button>
                <div className="ml-auto flex items-center gap-2">
                  <input type="number" min="0" max="100" placeholder="Dto%" value={item.descuentoPct || ""}
                    onChange={(e) => updateItem(item.productoId, { descuentoPct: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)) })}
                    className="w-16 h-8 rounded-lg border bg-background text-center text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  <input type="number" min="0" placeholder="Bon." value={item.cantidadRegalo || ""}
                    onChange={(e) => updateItem(item.productoId, { cantidadRegalo: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-14 h-8 rounded-lg border bg-background text-center text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Total y acciones */}
      <div className="sticky bottom-20 md:bottom-4 bg-card border rounded-2xl p-4 space-y-3 shadow-xl">
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">Total del pedido</span>
          <span className="font-bold text-2xl text-emerald-600 dark:text-emerald-400">${formatPrice(total)}</span>
        </div>
        {/* Exportar */}
        <div className="grid grid-cols-4 gap-2">
          <button onClick={handleWhatsApp}
            className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-green-600 text-white font-semibold text-xs hover:bg-green-700 transition-colors">
            <Send className="w-4 h-4" /> WhatsApp
          </button>
          <button onClick={handlePDF}
            className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-xs hover:bg-red-600 transition-colors">
            <FileSpreadsheet className="w-4 h-4" /> PDF
          </button>
          <button onClick={handleExcelPedido}
            className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors">
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
          <button onClick={handleEmail}
            className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-blue-500 text-white font-semibold text-xs hover:bg-blue-600 transition-colors">
            <Send className="w-4 h-4" /> Email
          </button>
        </div>
        {/* Confirmar */}
        <button onClick={handleConfirmar} disabled={sending}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-base shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Confirmar y guardar pedido</>}
        </button>
        <button onClick={() => { if (confirm("¿Querés vaciar el pedido actual?")) clearPedido(); }}
          className="w-full py-2 text-xs text-destructive hover:underline text-center">
          Vaciar pedido
        </button>
      </div>
    </div>
  );
}

// ==================== CLIENTES VIEW ====================
function ClientesView() {
  const { clienteActivo, setClienteActivo } = useMayolistaStore();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const res = await fetch("/api/clientes", { headers: authHeaders() });
      if (res.ok) setClientes(await res.json());
    } catch { /* ignore */ }
  };

  const handleCreate = async () => {
    if (!nombre.trim()) { toast.error("Ingresá el nombre"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ nombre: nombre.trim(), telefono, email, direccion }),
      });
      if (res.ok) {
        toast.success("Cliente creado");
        setNombre(""); setTelefono(""); setEmail(""); setDireccion("");
        loadClientes();
      } else toast.error("Error");
    } catch { toast.error("Error de conexión"); }
    finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      <BackButton />
      <h2 className="text-2xl font-bold">Mis Clientes</h2>

      <div className="p-5 rounded-2xl border bg-card space-y-3">
        <h3 className="font-semibold">Nuevo cliente</h3>
        <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        <input type="tel" placeholder="Teléfono (opcional)" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        <button onClick={handleCreate} disabled={loading} className="w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 text-base">
          {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Crear cliente"}
        </button>
      </div>

      {clientes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay clientes cargados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {clientes.map((c: any) => (
            <button
              key={c.id}
              onClick={() => { setClienteActivo(c); toast.success(`Cliente ${c.nombre} seleccionado`); }}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border bg-card hover:border-emerald-300 transition-all text-left ${clienteActivo?.id === c.id ? "border-emerald-400 bg-emerald-50/50" : ""}`}
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-sm">{c.nombre}</p>
                {c.telefono && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> {c.telefono}</p>}
                {c.direccion && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.direccion}</p>}
              </div>
              {clienteActivo?.id === c.id && <Check className="w-5 h-5 text-emerald-600 ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== HISTORIAL VIEW ====================
function HistorialView() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/pedidos", { headers: authHeaders() });
        if (res.ok) {
          const data = await res.json();
          setPedidos(data);
        } else {
          const err = await res.json().catch(() => ({}));
          setError(err.error || `Error ${res.status}`);
        }
      } catch (e: any) {
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="animate-fade-in-up space-y-4">
      <BackButton />
      <div>
        <h2 className="text-2xl font-bold">Historial de Pedidos</h2>
        <p className="text-muted-foreground text-sm mt-1">Tocá un pedido para ver el detalle</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-500 font-medium">{error}</p>
          <p className="text-xs text-muted-foreground mt-1">Intentá salir y volver a entrar</p>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="text-center py-16">
          <History className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground">No hay pedidos aún</p>
          <p className="text-xs text-muted-foreground mt-1">Los pedidos confirmados aparecen acá</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pedidos.map((p: any) => {
            const isOpen = expandedId === p.id;
            const clienteNombre = p.cliente?.nombre || "Sin cliente";
            const clienteDireccion = p.cliente?.direccion || p.observaciones || "";
            const fecha = new Date(p.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
            const hora = new Date(p.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
            const itemCount = p.items?.length || 0;

            return (
              <div key={p.id} className="rounded-2xl border bg-card overflow-hidden">
                {/* Cabecera del pedido — siempre visible */}
                <button
                  onClick={() => setExpandedId(isOpen ? null : p.id)}
                  className="w-full p-4 text-left hover:bg-muted/40 active:bg-muted/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-base leading-tight truncate">{clienteNombre}</p>
                        {clienteDireccion && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />{clienteDireccion}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">{fecha} {hora} · {itemCount} ítem{itemCount !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-emerald-600 text-lg">${formatPrice(p.total)}</p>
                      <ChevronRight className={`w-4 h-4 text-muted-foreground ml-auto mt-1 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                    </div>
                  </div>
                </button>

                {/* Detalle expandible */}
                {isOpen && (
                  <div className="border-t bg-muted/20 px-4 pb-4 pt-3 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{p.numero} · {p.mayorista?.nombre}</p>
                    {p.items?.map((item: any) => {
                      const subtotal = item.precioUnitario * item.cantidad * (1 - item.descuentoPct / 100);
                      return (
                        <div key={item.id} className="flex items-start justify-between gap-2 py-1.5 border-b border-border/50 last:border-0">
                          <div className="min-w-0 flex-1">
                            {item.producto?.codigo && (
                              <span className="inline-block px-1 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground mr-1">{item.producto.codigo}</span>
                            )}
                            <span className="text-sm font-medium">{item.producto?.descripcion}</span>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              x{item.cantidad}{item.cantidadRegalo > 0 ? ` +${item.cantidadRegalo} bon.` : ""} · ${formatPrice(item.precioUnitario)} c/u
                              {item.descuentoPct > 0 && <span className="text-emerald-600"> · {item.descuentoPct}% dto</span>}
                            </p>
                          </div>
                          <p className="font-semibold text-emerald-600 text-sm shrink-0">${formatPrice(subtotal)}</p>
                        </div>
                      );
                    })}
                    <div className="flex justify-between items-center pt-2 font-bold text-base">
                      <span>Total</span>
                      <span className="text-emerald-600">${formatPrice(p.total)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==================== MAESTRO VIEW ====================
function MaestroView() {
  const { mayoristaActivo, productos, setProductos, setCurrentView } = useMayolistaStore();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ codigo: "", descripcion: "", precio: "" });
  const [saving, setSaving] = useState(false);
  const [addForm, setAddForm] = useState({ codigo: "", descripcion: "", precio: "" });
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return productos;
    const q = normalizeText(search);
    return productos.filter(
      (p) => normalizeText(p.descripcion).includes(q) || normalizeText(p.codigo).includes(q)
    );
  }, [search, productos]);

  const handleEdit = (p: { id: string; codigo: string; descripcion: string; precio: number }) => {
    setEditingId(p.id);
    setEditValues({ codigo: p.codigo, descripcion: p.descripcion, precio: String(p.precio) });
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/productos?id=${id}`, {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          codigo: editValues.codigo,
          descripcion: editValues.descripcion,
          precio: parseFloat(editValues.precio) || 0,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProductos(productos.map((p) => (p.id === id ? updated : p)));
        setEditingId(null);
        toast.success("Producto actualizado");
      } else {
        toast.error("Error al guardar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    try {
      const res = await fetch(`/api/productos?id=${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) {
        setProductos(productos.filter((p) => p.id !== id));
        toast.success("Producto eliminado");
      } else {
        toast.error("Error al eliminar");
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  const handleAdd = async () => {
    if (!addForm.descripcion.trim()) { toast.error("Ingresá la descripción"); return; }
    if (!mayoristaActivo) return;
    setAdding(true);
    try {
      const res = await fetch("/api/productos", {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          mayoristaId: mayoristaActivo.id,
          productos: [{ codigo: addForm.codigo, descripcion: addForm.descripcion, precio: parseFloat(addForm.precio) || 0 }],
          replace: false,
        }),
      });
      if (res.ok) {
        const prodRes = await fetch(`/api/productos?mayoristaId=${mayoristaActivo.id}`, { headers: authHeaders() });
        if (prodRes.ok) setProductos(await prodRes.json());
        setAddForm({ codigo: "", descripcion: "", precio: "" });
        toast.success("Producto agregado");
      } else {
        toast.error("Error al agregar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setAdding(false);
    }
  };

  if (!mayoristaActivo) {
    return (
      <div className="animate-fade-in-up text-center py-20">
        <Layers className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Sin comercio activo</h3>
        <p className="text-muted-foreground mb-6">Primero configurá un comercio</p>
        <button onClick={() => setCurrentView("mayorista")} className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors">
          Ir a Comercios
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-4">
      <BackButton />
      <div>
        <h2 className="text-2xl font-bold">Maestro de Productos</h2>
        <p className="text-muted-foreground mt-1">{mayoristaActivo.nombre} · {productos.length} productos</p>
      </div>

      {/* Agregar producto */}
      <div className="p-4 rounded-2xl border bg-card space-y-3">
        <h3 className="font-semibold text-sm">Agregar producto</h3>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Código"
            value={addForm.codigo}
            onChange={(e) => setAddForm((f) => ({ ...f, codigo: e.target.value }))}
            className="px-3 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="number"
            placeholder="Precio"
            value={addForm.precio}
            onChange={(e) => setAddForm((f) => ({ ...f, precio: e.target.value }))}
            className="px-3 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <input
          type="text"
          placeholder="Descripción *"
          value={addForm.descripcion}
          onChange={(e) => setAddForm((f) => ({ ...f, descripcion: e.target.value }))}
          className="w-full px-3 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !addForm.descripcion.trim()}
          className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Agregar</>}
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={`Buscar en ${productos.length} productos...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Lista */}
      <div className="space-y-2 max-h-[calc(100vh-420px)] overflow-y-auto scrollbar-thin">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay productos</p>
          </div>
        )}

        {filtered.map((p) =>
          editingId === p.id ? (
            <div key={p.id} className="p-3 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={editValues.codigo}
                  onChange={(e) => setEditValues((v) => ({ ...v, codigo: e.target.value }))}
                  placeholder="Código"
                  className="px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="number"
                  value={editValues.precio}
                  onChange={(e) => setEditValues((v) => ({ ...v, precio: e.target.value }))}
                  placeholder="Precio"
                  className="px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <input
                type="text"
                value={editValues.descripcion}
                onChange={(e) => setEditValues((v) => ({ ...v, descripcion: e.target.value }))}
                placeholder="Descripción"
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleSave(p.id)}
                  disabled={saving}
                  className="flex-1 py-2 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Check className="w-3 h-3" /> Guardar</>}
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-4 py-2 rounded-lg border text-xs font-medium hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:border-emerald-200 dark:hover:border-emerald-800 transition-all">
              <div className="flex-1 min-w-0">
                {p.codigo && (
                  <span className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 mb-0.5">
                    {p.codigo}
                  </span>
                )}
                <p className="text-sm font-medium leading-snug truncate">{p.descripcion}</p>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">${formatPrice(p.precio)}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => handleEdit(p)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="Editar"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.descripcion)}
                  className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        )}

        {filtered.length > 0 && (
          <p className="text-center text-xs text-muted-foreground py-2">
            {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
            {search.trim() && ` encontrado${filtered.length !== 1 ? "s" : ""}`}
          </p>
        )}
      </div>
    </div>
  );
}

// ==================== MAIN APP ====================
export default function Home() {
  const { currentView, user, setUser, setCurrentView, setMayoristaActivo, setProductos, setLogo } = useMayolistaStore();
  const [initialized, setInitialized] = useState(false);

  // Un solo efecto que corre UNA VEZ al montar: restaura usuario + comercio
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const savedUserStr = localStorage.getItem("mayolista_user");
        if (!savedUserStr) return; // sin usuario → mostrar login

        const savedUser = JSON.parse(savedUserStr);
        setUser(savedUser);

        // Restaurar logo si existe
        const savedLogo = localStorage.getItem("mayolista_logo");
        if (savedLogo) setLogo(savedLogo);

        try {
          const res = await fetch("/api/mayoristas", { headers: authHeaders() });
          if (!res.ok) { setCurrentView("mayorista"); return; }
          const list = await res.json();
          if (list.length > 0) {
            const active = list[0];
            setMayoristaActivo(active);
            const p = await fetch(`/api/productos?mayoristaId=${active.id}`, { headers: authHeaders() });
            if (p.ok) setProductos(await p.json());
            setCurrentView("buscar");
          } else {
            setCurrentView("mayorista");
          }
        } catch { setCurrentView("mayorista"); }
      } catch { /* ignore — muestra login */ }
      finally { if (!cancelled) setInitialized(true); }
    })();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user) return <LoginView />;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 pb-24 md:pb-6">
        <AnimatePresence mode="wait">
          {currentView === "dashboard" && <DashboardView key="dashboard" />}
          {currentView === "mayorista" && <MayoristaView key="mayorista" />}
          {currentView === "buscar" && <BuscarView key="buscar" />}
          {currentView === "pedido" && <PedidoView key="pedido" />}
          {currentView === "maestro" && <MaestroView key="maestro" />}
          {currentView === "clientes" && <ClientesView key="clientes" />}
          {currentView === "historial" && <HistorialView key="historial" />}
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
}
