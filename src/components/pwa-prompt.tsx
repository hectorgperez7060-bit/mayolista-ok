"use client";

import { useEffect, useState } from "react";

export function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Si ya está instalada como app, no mostrar nada
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Registrar service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Detectar iOS (Safari no tiene beforeinstallprompt)
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) && !(window as any).MSStream;
    setIsIOS(ios);

    if (ios) {
      // En iOS mostrar el banner después de 2 segundos
      const t = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(t);
    }

    // Android / Chrome: escuchar el evento nativo
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "80px",
        left: "12px",
        right: "12px",
        zIndex: 9999,
        background: "#ffffff",
        border: "1.5px solid #10b981",
        borderRadius: "16px",
        padding: "16px",
        boxShadow: "0 8px 32px rgba(16,185,129,0.18)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      {/* Ícono */}
      <img
        src="/logo-mayolista.png"
        alt="Mayolista-OK"
        style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0 }}
      />

      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#111" }}>
          Instalar Mayolista-OK
        </p>
        {isIOS ? (
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6b7280" }}>
            Tocá{" "}
            <span style={{ fontWeight: 600 }}>Compartir</span>{" "}
            <span style={{ fontSize: 16 }}>⎋</span> y luego{" "}
            <span style={{ fontWeight: 600 }}>"Agregar a inicio"</span>
          </p>
        ) : (
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6b7280" }}>
            Agregá la app a tu pantalla de inicio
          </p>
        )}
      </div>

      {/* Botón instalar (solo Android) o cerrar */}
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {!isIOS && (
          <button
            onClick={handleInstall}
            style={{
              background: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "8px 14px",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Instalar
          </button>
        )}
        <button
          onClick={() => setShow(false)}
          style={{
            background: "transparent",
            border: "none",
            fontSize: 20,
            color: "#9ca3af",
            cursor: "pointer",
            padding: "4px 6px",
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
