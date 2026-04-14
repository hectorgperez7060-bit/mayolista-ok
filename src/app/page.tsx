"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  LogIn,
  ShoppingCart,
  Search,
  Plus,
  Users,
  History,
  Share2,
  LogOut,
  Upload,
  Trash2,
  ChevronLeft,
  Check,
  AlertCircle,
  Package,
  Truck,
  FileSpreadsheet,
  Eye,
  Send,
  Phone,
  MapPin,
  Tag,
  Gift,
  Percent,
  X,
  Menu,
  Store,
  ClipboardList,
  ChevronDown,
  Download,
  Mic,
  MicOff,
} from "lucide-react";
import { useMayolistaStore } from "@/lib/store";
import { toast } from "sonner";

// Helper to get auth headers for API calls
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

function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("mayolista_user");
  if (stored) {
    try { return JSON.parse(stored)?.id || null; } catch { return null; }
  }
  return null;
}

// ==================== LOGIN VIEW ====================
function LoginView() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!nombre.trim() || !email.trim()) {
      toast.error("Completá tu nombre y email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nombre.trim(), email: email.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        useMayolistaStore.getState().setUser(data.user);
        localStorage.setItem("mayolista_user", JSON.stringify(data.user));
        toast.success(`¡Bienvenido, ${nombre.trim()}!`);
      } else {
        toast.error("Error al iniciar sesión");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-emerald-950 dark:via-gray-950 dark:to-emerald-950">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-200 dark:shadow-emerald-900/30 mb-4"
          >
            <img
              src="/logo-mayolista.png"
              alt="Mayolista-OK"
              className="w-16 h-16 rounded-2xl"
            />
          </motion.div>
          <h1 className="text-4xl font-bold text-gradient">Mayolista-OK</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Tu lista de mayorista, siempre lista
          </p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card rounded-2xl shadow-lg border p-6 space-y-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white dark:fill-gray-900">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-lg">Ingresá con tu cuenta</h2>
              <p className="text-sm text-muted-foreground">Acceso rápido y seguro</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Tu nombre</label>
              <input
                type="text"
                placeholder="Ej: Juan Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tu email</label>
              <input
                type="email"
                placeholder="Ej: juan@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || !nombre.trim() || !email.trim()}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Ingresar
              </>
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            100% gratis · Sin tarjeta de crédito
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ==================== HEADER ====================
function AppHeader() {
  const { user, currentView, setCurrentView, mayoristaActivo } = useMayolistaStore();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("mayolista_user");
    useMayolistaStore.getState().setUser(null);
  };

  const navItems = [
    { id: "dashboard", label: "Inicio", icon: Store },
    { id: "mayorista", label: "Mayorista", icon: Truck },
    { id: "buscar", label: "Buscar", icon: Search },
    { id: "pedido", label: "Pedido", icon: ShoppingCart },
    { id: "clientes", label: "Clientes", icon: Users },
    { id: "historial", label: "Historial", icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo + Nombre */}
        <button
          onClick={() => setCurrentView("dashboard")}
          className="flex items-center gap-2.5"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md">
            <img src="/logo-mayolista.png" alt="" className="w-6 h-6 rounded-lg" />
          </div>
          <div className="text-left">
            <h1 className="text-base font-bold leading-tight text-gradient">Mayolista-OK</h1>
            {mayoristaActivo && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium leading-tight truncate max-w-[180px]">
                {mayoristaActivo.nombre}
              </p>
            )}
          </div>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === item.id
                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="w-4 h-4" />
            </button>
          ))}
        </nav>

        {/* User menu */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-sm font-medium text-muted-foreground">
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

      {/* Mobile Nav */}
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

// ==================== MOBILE BOTTOM NAV ====================
function BottomNav() {
  const { currentView, setCurrentView } = useMayolistaStore();

  const items = [
    { id: "buscar", label: "Buscar", icon: Search },
    { id: "pedido", label: "Pedido", icon: ShoppingCart },
    { id: "clientes", label: "Clientes", icon: Users },
    { id: "historial", label: "Historial", icon: History },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t bg-card/95 backdrop-blur-lg">
      <div className="grid grid-cols-4 h-16">
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
  const {
    mayoristaActivo,
    setCurrentView,
    pedidoItems,
    productos,
  } = useMayolistaStore();
  const pedidoCount = pedidoItems.length;
  const totalItems = productos.length;

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-6 text-white">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <h2 className="text-2xl font-bold">
            {mayoristaActivo ? ` ${mayoristaActivo.nombre}` : "¡Bienvenido!"}
          </h2>
          <p className="text-emerald-100 mt-1">
            {mayoristaActivo
              ? `${mayoristaActivo.rubro} · ${mayoristaActivo._count?.productos || 0} productos`
              : "Configurá tu mayorista para empezar"}
          </p>
          {!mayoristaActivo && (
            <button
              onClick={() => setCurrentView("mayorista")}
              className="mt-4 px-5 py-2.5 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-colors flex items-center gap-2 shadow-lg"
            >
              <Store className="w-4 h-4" />
              Configurar mayorista
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setCurrentView("buscar")}
          className="p-4 rounded-xl border bg-card hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
        >
          <Package className="w-8 h-8 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-2xl font-bold">{totalItems || mayoristaActivo?._count?.productos || 0}</p>
          <p className="text-sm text-muted-foreground">Productos disponibles</p>
        </button>
        <button
          onClick={() => setCurrentView("pedido")}
          className="p-4 rounded-xl border bg-card hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
        >
          <ShoppingCart className="w-8 h-8 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-2xl font-bold">{pedidoCount}</p>
          <p className="text-sm text-muted-foreground">En tu pedido</p>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Acciones rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {mayoristaActivo && (
            <>
              <button
                onClick={() => setCurrentView("buscar")}
                className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <Search className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Buscar productos</p>
                  <p className="text-xs text-muted-foreground">Encontrá rápido lo que necesitás</p>
                </div>
              </button>
              <button
                onClick={() => setCurrentView("pedido")}
                className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Ver pedido</p>
                  <p className="text-xs text-muted-foreground">Revisá y enviá tu lista</p>
                </div>
              </button>
            </>
          )}
          <button
            onClick={() => setCurrentView("mayorista")}
            className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <Truck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-sm">Cambiar mayorista</p>
              <p className="text-xs text-muted-foreground">Cargá otra lista de precios</p>
            </div>
          </button>
          <button
            onClick={() => setCurrentView("clientes")}
            className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-sm">Mis clientes</p>
              <p className="text-xs text-muted-foreground">Gestioná tu cartera</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent wholesalers - loaded on demand */}
      {!mayoristaActivo && (
        <div className="space-y-3 p-4 rounded-xl border bg-card">
          <p className="text-sm text-muted-foreground text-center">
            🔔 Configurá tu primer mayorista para empezar a armar pedidos
          </p>
          <button
            onClick={() => setCurrentView("mayorista")}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            <Store className="w-5 h-5" />
            Configurar mayorista
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== MAYORISTA VIEW ====================
function MayoristaView() {
  const { setMayoristaActivo, setCurrentView } = useMayolistaStore();
  const [nombre, setNombre] = useState("");
  const [rubro, setRubro] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [currentMayoristaId, setCurrentMayoristaId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rubros = [
    "Ferretería",
    "Limpieza",
    "Alimentos",
    "Bebidas",
    "Tabacos",
    "Kiosco",
    "Indumentaria",
    "Calzado",
    "Electrónica",
    "Pinturería",
    "Plomería",
    "Electricidad",
    "Otros",
  ];

  const handleCreateMayorista = async () => {
    if (!nombre.trim() || !rubro) {
      toast.error("Completá el nombre y el rubro");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/mayoristas", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ nombre: nombre.trim(), rubro }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentMayoristaId(data.id);
        toast.success(`Mayorista "${nombre}" creado. Ahora cargá tu lista.`);
      } else {
        toast.error("Error al crear mayorista");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!file || !currentMayoristaId) {
      toast.error("Primero creá el mayorista y elegí un archivo");
      return;
    }

    setUploading(true);
    setUploadProgress("Leyendo archivo...");

    try {
      // Step 1: Read Excel in the browser
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (rows.length === 0) {
        toast.error("El archivo está vacío");
        setUploading(false);
        return;
      }

      // Step 2: Process in the browser - map columns
      setUploadProgress(`Procesando ${rows.length} filas...`);

      const keys = Object.keys(rows[0]);
      const products: { codigo: string; descripcion: string; precio: number }[] = [];

      for (const raw of rows) {
        // Find description = column with longest text
        let descKey: string | null = null;
        let longestTextLen = 0;
        for (const k of keys) {
          const val = String(raw[k] || "").trim();
          if (val.length > longestTextLen && val.length > 3) {
            longestTextLen = val.length;
            descKey = k;
          }
        }

        // Find numeric columns
        const numericCols: { key: string; value: number; name: string }[] = [];
        for (const k of keys) {
          if (k === descKey) continue;
          if (typeof raw[k] === "number" && raw[k] > 0) {
            numericCols.push({ key: k, value: raw[k], name: k.toLowerCase() });
          }
        }

        // Find precio - prefer "$ unit"
        let precioKey: string | null = null;
        for (const col of numericCols) {
          if (col.name.includes("$ unit") || col.name.includes("preciounitario")) {
            precioKey = col.key;
            break;
          }
        }

        // Find codigo - remaining numeric
        let codigoKey: string | null = null;
        for (const col of numericCols) {
          if (col.key !== precioKey && !codigoKey) {
            codigoKey = col.key;
          }
        }

        const codigo = codigoKey ? String(raw[codigoKey] || "").trim() : "";
        const descripcion = descKey ? String(raw[descKey] || "").trim() : "";
        const precio = precioKey ? (Number(raw[precioKey]) || 0) : 0;

        if (!descripcion && !codigo) continue;
        if (!codigo && precio === 0 && descripcion.includes(";")) continue;

        products.push({ codigo, descripcion: descripcion || codigo, precio });
      }

      if (products.length === 0) {
        toast.error("No se encontraron productos en el archivo");
        setUploading(false);
        return;
      }

      // Step 3: Send in chunks of 300 (each chunk takes ~2-3 seconds)
      const CHUNK_SIZE = 300;
      const totalChunks = Math.ceil(products.length / CHUNK_SIZE);
      let totalLoaded = 0;

      // First chunk: delete old + insert first batch
      setUploadProgress(`Enviando lote 1 de ${totalChunks}...`);

      const firstChunk = products.slice(0, CHUNK_SIZE);
      const firstRes = await fetch("/api/productos", {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          mayoristaId: currentMayoristaId,
          productos: firstChunk,
          replace: true, // delete old products
        }),
      });

      if (!firstRes.ok) {
        const err = await firstRes.text();
        toast.error("Error: " + err);
        setUploading(false);
        setUploadProgress("");
        return;
      }

      totalLoaded += firstChunk.length;
      setUploadProgress(`${totalLoaded} de ${products.length} productos...`);

      // Remaining chunks
      for (let i = 1; i < totalChunks; i++) {
        const chunk = products.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        setUploadProgress(`Enviando lote ${i + 1} de ${totalChunks} (${totalLoaded} cargados)...`);

        const chunkRes = await fetch("/api/productos", {
          method: "POST",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            mayoristaId: currentMayoristaId,
            productos: chunk,
            replace: false, // don't delete, just add
          }),
        });

        if (!chunkRes.ok) {
          toast.error(`Error en lote ${i + 1}, se cargaron ${totalLoaded} productos`);
          break;
        }

        totalLoaded += chunk.length;
        setUploadProgress(`${totalLoaded} de ${products.length} productos...`);
      }

      toast.success(`✅ ${totalLoaded} productos cargados OK`);
      setUploadProgress(`¡${totalLoaded} productos listos!`);

      // Set as active mayorista
      const mayoristaRes = await fetch("/api/mayoristas", { headers: authHeaders() });
      if (mayoristaRes.ok) {
        const mayoristas = await mayoristaRes.json();
        const active = mayoristas.find((m: any) => m.id === currentMayoristaId);
        if (active) {
          setMayoristaActivo(active);
          setCurrentView("buscar");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al procesar el archivo");
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configurar Mayorista</h2>
        <p className="text-muted-foreground mt-1">
          Cargá los datos del mayorista y subí tu lista de precios
        </p>
      </div>

      {!currentMayoristaId ? (
        /* Step 1: Create mayorista */
        <div className="space-y-4 p-6 rounded-2xl border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-sm">
              1
            </div>
            <h3 className="font-semibold">Datos del mayorista</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nombre del mayorista</label>
              <input
                type="text"
                placeholder="Ej: Distribuidora Tomás"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Rubro</label>
              <div className="flex flex-wrap gap-2">
                {rubros.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRubro(r)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      rubro === r
                        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateMayorista}
              disabled={loading || !nombre.trim() || !rubro}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Crear mayorista
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Step 2: Upload list */
        <div className="space-y-4 p-6 rounded-2xl border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-sm">
              2
            </div>
            <h3 className="font-semibold">Subir lista de precios</h3>
          </div>

          <div className="text-sm text-muted-foreground space-y-2 mb-4">
            <p>Subí tu archivo Excel o CSV con las siguientes columnas:</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-mono">
                código
              </span>
              <span className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-mono">
                descripción
              </span>
              <span className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-mono">
                precio
              </span>
            </div>
            <p className="text-xs">
              Si tu archivo tiene otros nombres de columnas, los vamos a intentar reconocer automáticamente.
            </p>
          </div>

          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 ${
              file ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-muted-foreground/25"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFile(f);
              }}
              className="hidden"
            />
            {file ? (
              <div className="space-y-2">
                <FileSpreadsheet className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-xs text-destructive hover:underline"
                >
                  Quitar archivo
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-10 h-10 text-muted-foreground mx-auto" />
                <p className="font-medium text-sm">Tocá para elegir un archivo</p>
                <p className="text-xs text-muted-foreground">Excel (.xlsx, .xls) o CSV</p>
              </div>
            )}
          </div>

          {uploadProgress && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              {uploadProgress}
            </div>
          )}

          <button
            onClick={handleFileUpload}
            disabled={uploading || !file}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Cargar lista
              </>
            )}
          </button>

          <button
            onClick={() => {
              setCurrentMayoristaId("");
              setFile(null);
            }}
            className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Volver al paso anterior
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== BUSCAR VIEW ====================
function BuscarView() {
  const { mayoristaActivo, productos, setProductos, addItem, setCurrentView } = useMayolistaStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [cantidad, setCantidad] = useState(1);
  const [cantidadRegalo, setCantidadRegalo] = useState(0);
  const [descuentoPct, setDescuentoPct] = useState(0);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [listening, setListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load products when mayorista changes
  useEffect(() => {
    async function load() {
      if (!mayoristaActivo?.id) return;
      try {
        const res = await fetch(`/api/productos?mayoristaId=${mayoristaActivo.id}`, { headers: authHeaders() });
        if (res.ok) {
          const data = await res.json();
          setProductos(data);
        }
      } catch {
        /* ignore */
      }
    }
    load();
  }, [mayoristaActivo?.id, setProductos]);

  // Also reload products after upload completes
  const reloadProducts = async () => {
    if (!mayoristaActivo?.id) return;
    try {
      const res = await fetch(`/api/productos?mayoristaId=${mayoristaActivo.id}`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setProductos(data);
      }
    } catch {
      /* ignore */
    }
  };

  // Voice search with Web Speech API
  const toggleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Tu navegador no soporta búsqueda por voz");
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-AR";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setQuery(transcript);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const [aiSearching, setAiSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim() || !mayoristaActivo?.id) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/productos?mayoristaId=${mayoristaActivo.id}&q=${encodeURIComponent(query)}`,
        { headers: authHeaders() }
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        if (data.length === 0) {
          toast.info("No encontré nada. Probá con menos palabras.");
        }
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // Simple search: filter loaded products by text match (no fuzzy, no complex logic)
  const normalizeText = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const normalizedQuery = normalizeText(query.trim());
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length >= 2);
  const meaningfulWords = queryWords.length > 1 ? queryWords.filter(w => w.length >= 3) : queryWords;

  const localResults = meaningfulWords.length > 0 && productos.length > 0
    ? productos.filter(p => {
        const desc = normalizeText(p.descripcion || "");
        const cod = normalizeText(p.codigo || "");
        return meaningfulWords.some(w => desc.includes(w) || cod.includes(w));
      }).slice(0, 50)
    : [];

  // Display: if we have local results show them, otherwise show API results
  const displayResults = localResults.length > 0 ? localResults : results;

  const handleAddToPedido = () => {
    if (!selectedProduct || cantidad < 1) return;
    addItem({
      cantidad,
      cantidadRegalo,
      precioUnitario: selectedProduct.precio,
      descuentoPct,
      productoId: selectedProduct.id,
      producto: selectedProduct,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setSelectedProduct(null);
      setCantidad(1);
      setCantidadRegalo(0);
      setDescuentoPct(0);
    }, 800);
  };

  // Calculate caja + regalo
  const handleCajaRegalo = (cajas: number, regaloPorCaja: number) => {
    setCantidad(cajas);
    setCantidadRegalo(regaloPorCaja * cajas);
  };

  if (!mayoristaActivo) {
    return (
      <div className="animate-fade-in-up text-center py-20">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Sin mayorista activo</h3>
        <p className="text-muted-foreground mb-6">Primero configurá un mayorista y cargá tu lista</p>
        <button
          onClick={() => setCurrentView("mayorista")}
          className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors"
        >
          Ir a mayorista
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Buscar Productos</h2>
        <p className="text-muted-foreground mt-1">
          Escribí código o descripción para encontrar rápido
        </p>
      </div>

      {/* Search bar with microphone and AI */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Escribí o hablá para buscar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="w-full pl-12 pr-24 py-3.5 rounded-xl border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-base"
          autoFocus
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {(loading || aiSearching) && (
            <div className="flex items-center gap-1 mr-1">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              {aiSearching && <span className="text-[10px] text-emerald-600 font-medium">IA</span>}
            </div>
          )}
          <button
            onClick={toggleVoiceSearch}
            className={`p-2 rounded-lg transition-all ${
              listening
                ? "bg-red-100 dark:bg-red-900/40 text-red-600 animate-pulse"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
            title={listening ? "Dejar de escuchar" : "Buscar por voz"}
          >
            {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Results */}
      {!selectedProduct ? (
        <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto scrollbar-thin">
          {query.trim().length < 2 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Escribí al menos 2 caracteres</p>
            </div>
          )}
          {displayResults.length === 0 && query.trim().length >= 2 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No se encontraron productos</p>
              <p className="text-xs mt-1">Probá con otras palabras</p>
            </div>
          )}
          {displayResults.map((product: any, idx: number) => (
            <motion.button
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => {
                setSelectedProduct(product);
                setCantidad(1);
                setCantidadRegalo(0);
                setDescuentoPct(0);
              }}
              className="w-full text-left p-4 rounded-xl border bg-card hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                      {product.codigo}
                    </span>
                  </div>
                  <p className="font-medium text-sm">{product.descripcion}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    ${product.precio.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      ) : (
        /* Product selected - add to order */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl border bg-card space-y-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                {selectedProduct.codigo}
              </span>
              <h3 className="font-semibold text-lg mt-2">{selectedProduct.descripcion}</h3>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                ${selectedProduct.precio.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <button
              onClick={() => setSelectedProduct(null)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cantidad */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Package className="w-4 h-4" />
                Cantidad
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-muted transition-colors text-lg font-bold"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 text-center px-3 py-2 rounded-lg border bg-background text-foreground text-lg font-semibold"
                />
                <button
                  onClick={() => setCantidad(cantidad + 1)}
                  className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-muted transition-colors text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Cantidad regalo (cajas + regalo) */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Cantidad de regalo (unit. extra)
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCantidadRegalo(Math.max(0, cantidadRegalo - 1))}
                  className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-muted transition-colors text-lg font-bold"
                >
                  −
                </button>
                <input
                  type="number"
                  min="0"
                  value={cantidadRegalo}
                  onChange={(e) => setCantidadRegalo(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 text-center px-3 py-2 rounded-lg border bg-background text-foreground text-lg font-semibold"
                />
                <button
                  onClick={() => setCantidadRegalo(cantidadRegalo + 1)}
                  className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-muted transition-colors text-lg font-bold"
                >
                  +
                </button>
              </div>
              {/* Quick: cajas + regalo */}
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => handleCajaRegalo(12, 1)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors font-medium"
                >
                  12 + 1 regalo
                </button>
                <button
                  onClick={() => handleCajaRegalo(24, 2)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors font-medium"
                >
                  24 + 2 regalo
                </button>
                <button
                  onClick={() => handleCajaRegalo(6, 1)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors font-medium"
                >
                  6 + 1 regalo
                </button>
                <button
                  onClick={() => handleCajaRegalo(12, 0)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors font-medium"
                >
                  12 cajas
                </button>
                <button
                  onClick={() => handleCajaRegalo(24, 0)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors font-medium"
                >
                  24 cajas
                </button>
              </div>
            </div>

            {/* Descuento */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Percent className="w-4 h-4" />
                Descuento por línea
              </label>
              <div className="flex flex-wrap gap-2">
                {[0, 3, 5, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setDescuentoPct(pct)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      descuentoPct === pct
                        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Subtotal */}
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {cantidad} × ${selectedProduct.precio.toLocaleString("es-AR")}
              </span>
              <span>
                ${((cantidad + cantidadRegalo) * selectedProduct.precio).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            {cantidadRegalo > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>+ {cantidadRegalo} de regalo</span>
                <span>${(cantidadRegalo * selectedProduct.precio).toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {descuentoPct > 0 && (
              <div className="flex justify-between text-sm text-destructive">
                <span>- {descuentoPct}% descuento</span>
                <span>
                  -$
                  {(
                    ((cantidad + cantidadRegalo) * selectedProduct.precio * descuentoPct) /
                    100
                  ).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-emerald-200 dark:border-emerald-800">
              <span>Subtotal</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                $
                {(
                  ((cantidad + cantidadRegalo) * selectedProduct.precio * (100 - descuentoPct)) /
                  100
                ).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Add button */}
          <button
            onClick={handleAddToPedido}
            className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
              added
                ? "bg-green-500"
                : "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 hover:from-emerald-600 hover:to-emerald-700"
            }`}
          >
            {added ? (
              <>
                <Check className="w-5 h-5" />
                ¡Agregado al pedido!
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Agregar al pedido
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ==================== PEDIDO VIEW ====================
function PedidoView() {
  const {
    pedidoItems,
    removeItem,
    updateItem,
    descuentoGlobal,
    setDescuentoGlobal,
    clearPedido,
    getTotalPedido,
    mayoristaActivo,
    clienteActivo,
    setCurrentView,
  } = useMayolistaStore();
  const [observaciones, setObservaciones] = useState("");
  const [saving, setSaving] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const total = getTotalPedido();

  const handleSavePedido = async () => {
    if (pedidoItems.length === 0) {
      toast.error("El pedido está vacío");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          clienteId: clienteActivo?.id || null,
          mayoristaId: mayoristaActivo?.id,
          items: pedidoItems.map((item) => ({
            cantidad: item.cantidad,
            cantidadRegalo: item.cantidadRegalo,
            precioUnitario: item.precioUnitario,
            descuentoPct: item.descuentoPct,
            productoId: item.productoId,
          })),
          observaciones,
          descuentoPct: descuentoGlobal,
        }),
      });

      if (res.ok) {
        toast.success("¡Pedido guardado correctamente!");
        clearPedido();
        setObservaciones("");
        setCurrentView("historial");
      } else {
        toast.error("Error al guardar el pedido");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const buildPedidoText = () => {
    let text = `📋 PEDIDO - ${mayoristaActivo?.nombre || ""}\n`;
    if (clienteActivo) {
      text += `👤 Cliente: ${clienteActivo.nombre}\n`;
    }
    text += `📅 ${new Date().toLocaleDateString("es-AR")}\n`;
    text += `─────────────────\n\n`;

    pedidoItems.forEach((item, idx) => {
      const subtotal =
        (item.cantidad + item.cantidadRegalo) *
        item.precioUnitario *
        (1 - item.descuentoPct / 100);
      text += `${idx + 1}. ${item.producto.descripcion}\n`;
      text += `   Código: ${item.producto.codigo}\n`;
      text += `   Cant: ${item.cantidad}`;
      if (item.cantidadRegalo > 0) text += ` (+${item.cantidadRegalo} regalo)`;
      if (item.descuentoPct > 0) text += ` (-${item.descuentoPct}%)`;
      text += `\n   $${subtotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}\n\n`;
    });

    if (descuentoGlobal > 0) {
      text += `Descuento global: -${descuentoGlobal}%\n`;
    }
    text += `─────────────────\n`;
    text += `💰 TOTAL: $${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}\n`;
    if (observaciones) text += `\n📝 ${observaciones}`;

    return text;
  };

  const shareWhatsApp = () => {
    const text = buildPedidoText();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareEmail = () => {
    const text = buildPedidoText();
    const subject = `Pedido - ${mayoristaActivo?.nombre || "Mayolista-OK"}`;
    window.open(
      `mailto:${clienteActivo?.email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const downloadExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const data = pedidoItems.map((item, idx) => ({
        "#": idx + 1,
        Código: item.producto.codigo,
        Descripción: item.producto.descripcion,
        Cantidad: item.cantidad,
        "Regalo": item.cantidadRegalo || 0,
        "Precio Unit.": item.precioUnitario,
        "Descuento %": item.descuentoPct || 0,
        Subtotal: (
          (item.cantidad + item.cantidadRegalo) *
          item.precioUnitario *
          (1 - item.descuentoPct / 100)
        ).toFixed(2),
      }));

      // Add total row
      data.push({
        "#": "",
        Código: "",
        Descripción: "TOTAL",
        Cantidad: "",
        "Regalo": "",
        "Precio Unit.": "",
        "Descuento %": descuentoGlobal ? `${descuentoGlobal}%` : "",
        Subtotal: total.toFixed(2),
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Pedido");
      XLSX.writeFile(wb, `pedido_${mayoristaActivo?.nombre || "mayolista"}.xlsx`);
      toast.success("Excel descargado");
    } catch {
      toast.error("Error al generar Excel");
    }
  };

  const downloadCSV = () => {
    let csv = "N°,Código,Descripción,Cantidad,Regalo,Precio Unit.,Descuento %,Subtotal\n";
    pedidoItems.forEach((item, idx) => {
      const subtotal =
        (item.cantidad + item.cantidadRegalo) *
        item.precioUnitario *
        (1 - item.descuentoPct / 100);
      csv += `${idx + 1},"${item.producto.codigo}","${item.producto.descripcion}",${item.cantidad},${item.cantidadRegalo},${item.precioUnitario},${item.descuentoPct},${subtotal.toFixed(2)}\n`;
    });
    csv += `,,,,,,TOTAL,${total.toFixed(2)}\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedido_${mayoristaActivo?.nombre || "mayolista"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV descargado");
  };

  const downloadPDF = () => {
    // Build a printable HTML page
    const pedidoHtml = buildPedidoText().replace(/\n/g, "<br>");
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Pedido - ${mayoristaActivo?.nombre || "Mayolista-OK"}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #333; }
            h1 { color: #059669; font-size: 24px; }
            .total { font-size: 20px; font-weight: bold; color: #059669; margin-top: 20px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>🛒 Pedido</h1>
          <div>${pedidoHtml}</div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      toast.success("PDF listo para imprimir");
    }
  };

  if (pedidoItems.length === 0 && !showShare) {
    return (
      <div className="animate-fade-in-up text-center py-20">
        <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Tu pedido está vacío</h3>
        <p className="text-muted-foreground mb-6">Buscá productos y agregalos a tu pedido</p>
        <button
          onClick={() => setCurrentView("buscar")}
          className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors"
        >
          Ir a buscar
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tu Pedido</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {pedidoItems.length} producto{pedidoItems.length !== 1 ? "s" : ""}
            {clienteActivo && ` · ${clienteActivo.nombre}`}
          </p>
        </div>
        {pedidoItems.length > 0 && (
          <button
            onClick={() => clearPedido()}
            className="text-sm text-destructive hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Vaciar
          </button>
        )}
      </div>

      {/* Items list */}
      <div className="space-y-2 max-h-[calc(100vh-420px)] overflow-y-auto scrollbar-thin">
        {pedidoItems.map((item, idx) => {
          const subtotal =
            (item.cantidad + item.cantidadRegalo) *
            item.precioUnitario *
            (1 - item.descuentoPct / 100);
          return (
            <motion.div
              key={item.productoId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 rounded-xl border bg-card space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground">
                      {item.producto.codigo}
                    </span>
                  </div>
                  <p className="font-medium text-sm leading-tight">{item.producto.descripcion}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    $ {item.precioUnitario.toLocaleString("es-AR")} c/u
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.productoId)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Cant:</span>
                  <button
                    onClick={() =>
                      item.cantidad > 1 && updateItem(item.productoId, { cantidad: item.cantidad - 1 })
                    }
                    className="w-7 h-7 rounded border flex items-center justify-center hover:bg-muted transition-colors text-xs font-bold"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) =>
                      updateItem(item.productoId, {
                        cantidad: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                    className="w-14 text-center px-1 py-1 rounded border bg-background text-foreground text-sm font-semibold"
                  />
                  <button
                    onClick={() => updateItem(item.productoId, { cantidad: item.cantidad + 1 })}
                    className="w-7 h-7 rounded border flex items-center justify-center hover:bg-muted transition-colors text-xs font-bold"
                  >
                    +
                  </button>
                </div>

                {item.cantidadRegalo > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-medium">
                    +{item.cantidadRegalo} regalo
                  </span>
                )}

                {item.descuentoPct > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-medium">
                    -{item.descuentoPct}%
                  </span>
                )}

                <div className="ml-auto">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    ${subtotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Descuento global + Observaciones */}
      <div className="space-y-3 p-4 rounded-xl border bg-card">
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Percent className="w-4 h-4" />
            Descuento general
          </label>
          <div className="flex flex-wrap gap-2">
            {[0, 3, 5, 10, 15, 20].map((pct) => (
              <button
                key={pct}
                onClick={() => setDescuentoGlobal(pct)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  descuentoGlobal === pct
                    ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Observaciones</label>
          <textarea
            placeholder="Notas adicionales para el pedido..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm resize-none"
            rows={2}
          />
        </div>
      </div>

      {/* Total + Actions */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-emerald-100">Total del pedido</span>
          <span className="text-2xl font-bold">${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
        </div>
        {descuentoGlobal > 0 && (
          <p className="text-emerald-200 text-xs">
            Incluye {descuentoGlobal}% de descuento general
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSavePedido}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-white text-emerald-700 font-semibold hover:bg-emerald-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Guardar
          </button>
          <button
            onClick={() => setShowShare(!showShare)}
            className="px-4 py-3 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Share options */}
      <AnimatePresence>
        {showShare && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl border bg-card space-y-2">
              <h4 className="font-semibold text-sm mb-3">Compartir pedido</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={shareWhatsApp}
                  className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors text-sm font-medium"
                >
                  <Phone className="w-4 h-4" />
                  WhatsApp
                </button>
                <button
                  onClick={shareEmail}
                  className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors text-sm font-medium"
                >
                  <Send className="w-4 h-4" />
                  Email
                </button>
                <button
                  onClick={downloadExcel}
                  className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors text-sm font-medium"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel
                </button>
                <button
                  onClick={downloadCSV}
                  className="flex items-center gap-2 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 p-3 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/50 transition-colors text-sm font-medium col-span-2"
                >
                  <Eye className="w-4 h-4" />
                  Imprimir / PDF
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== CLIENTES VIEW ====================
function ClientesView() {
  const { clienteActivo, setClienteActivo } = useMayolistaStore();
  const [clientes, setClientes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(true);

  const loadClientes = async () => {
    try {
      const res = await fetch("/api/clientes", { headers: authHeaders() });
      if (res.ok) setClientes(await res.json());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadClientes(); }, []);

  const handleCreate = async () => {
    if (!nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          nombre: nombre.trim(),
          telefono: telefono.trim() || null,
          email: email.trim() || null,
          direccion: direccion.trim() || null,
        }),
      });
      if (res.ok) {
        toast.success("Cliente creado");
        setNombre("");
        setTelefono("");
        setEmail("");
        setDireccion("");
        setShowForm(false);
        loadClientes();
      } else {
        toast.error("Error al crear cliente");
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mis Clientes</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">{clientes.length} registrado{clientes.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo
        </button>
      </div>

      {/* Active client banner */}
      {clienteActivo && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Pedido para: {clienteActivo.nombre}
            </span>
          </div>
          <button
            onClick={() => setClienteActivo(null)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Quitar
          </button>
        </div>
      )}

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl border bg-card space-y-3">
              <h3 className="font-semibold text-sm">Nuevo cliente</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nombre del cliente"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
                <input
                  type="tel"
                  placeholder="Teléfono (opcional)"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
                <input
                  type="email"
                  placeholder="Email (opcional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
                <input
                  type="text"
                  placeholder="Dirección (opcional)"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleCreate}
                  disabled={!nombre.trim()}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 text-sm"
                >
                  Guardar cliente
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Client list */}
      <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto scrollbar-thin">
        {clientes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Aún no tenés clientes registrados</p>
          </div>
        )}
        {clientes.map((c) => (
          <div
            key={c.id}
            className={`p-4 rounded-xl border bg-card transition-all ${
              clienteActivo?.id === c.id
                ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20"
                : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{c.nombre}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                  {c.telefono && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {c.telefono}
                    </span>
                  )}
                  {c.email && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Send className="w-3 h-3" />
                      {c.email}
                    </span>
                  )}
                  {c.direccion && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {c.direccion}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setClienteActivo(c);
                  toast.success(`Cliente "${c.nombre}" seleccionado para el pedido`);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  clienteActivo?.id === c.id
                    ? "bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200"
                    : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60"
                }`}
              >
                {clienteActivo?.id === c.id ? "Seleccionado" : "Seleccionar"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== HISTORIAL VIEW ====================
function HistorialView() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/pedidos", { headers: authHeaders() });
        if (res.ok) setPedidos(await res.json());
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Historial de Pedidos</h2>
        <p className="text-muted-foreground mt-0.5 text-sm">{pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""}</p>
      </div>

      {pedidos.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Sin pedidos aún</p>
          <p className="text-sm mt-1">Armá tu primer pedido y guardalo</p>
        </div>
      )}

      <div className="space-y-3">
        {pedidos.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border bg-card overflow-hidden"
          >
            <button
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
              className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-medium text-emerald-600">{p.numero}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      p.estado === "confirmado"
                        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {p.estado}
                  </span>
                </div>
                <p className="font-medium text-sm mt-0.5">{p.mayorista?.nombre}</p>
                {p.cliente && (
                  <p className="text-xs text-muted-foreground mt-0.5">Cliente: {p.cliente.nombre}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                  ${p.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(p.createdAt).toLocaleDateString("es-AR")}
                </p>
                <ChevronDown
                  className={`w-4 h-4 mx-auto mt-1 text-muted-foreground transition-transform ${
                    expanded === p.id ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            <AnimatePresence>
              {expanded === p.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t"
                >
                  <div className="p-4 space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                    {p.items?.map((item: any, idx: number) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm py-1.5 border-b last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="text-muted-foreground mr-2">{idx + 1}.</span>
                          <span className="text-xs font-mono text-muted-foreground mr-2">
                            {item.producto?.codigo}
                          </span>
                          <span>{item.producto?.descripcion}</span>
                          <span className="text-muted-foreground ml-2">
                            x{item.cantidad}
                            {item.cantidadRegalo > 0 && ` (+${item.cantidadRegalo})`}
                          </span>
                        </div>
                        <span className="font-medium shrink-0 ml-2">
                          $
                          {(
                            (item.cantidad + item.cantidadRegalo) *
                            item.precioUnitario *
                            (1 - (item.descuentoPct || 0) / 100)
                          ).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                    {p.observaciones && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        📝 {p.observaciones}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// Save icon component (missing from lucide-react import)
function Save({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
      <path d="M7 3v4a1 1 0 0 0 1 1h7" />
    </svg>
  );
}

// ==================== MAIN APP ====================
export default function Home() {
  const { currentView, user, setUser } = useMayolistaStore();

  // Recuperar usuario guardado en localStorage
  useEffect(() => {
    if (!user) {
      try {
        const saved = localStorage.getItem("mayolista_user");
        if (saved) {
          setUser(JSON.parse(saved));
        }
      } catch { /* ignore */ }
    }
  }, [user, setUser]);

  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 pb-24 md:pb-6">
        <AnimatePresence mode="wait">
          {currentView === "dashboard" && <DashboardView key="dashboard" />}
          {currentView === "mayorista" && <MayoristaView key="mayorista" />}
          {currentView === "buscar" && <BuscarView key="buscar" />}
          {currentView === "pedido" && <PedidoView key="pedido" />}
          {currentView === "clientes" && <ClientesView key="clientes" />}
          {currentView === "historial" && <HistorialView key="historial" />}
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
}
