import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans">
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">
            <span className="text-white font-black text-sm">M</span>
          </div>
          <span className="font-bold text-lg tracking-tight">Mayolista-OK</span>
        </div>
        <Link
          href="/"
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors"
        >
          Entrar a la app →
        </Link>
      </nav>

      {/* HERO */}
      <section className="text-center px-6 pt-16 pb-20 max-w-3xl mx-auto">
        <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
          Para vendedores y distribuidores
        </span>
        <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-6 text-gray-900">
          Tomá pedidos de mayorista{" "}
          <span className="text-emerald-500">desde tu celular</span>
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
          Cargá tu lista de precios, armá pedidos en segundos y compartí por
          PDF, Excel o WhatsApp — sin papeles, sin errores.
        </p>
        <Link
          href="/"
          className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-colors shadow-lg shadow-emerald-200"
        >
          Empezar gratis →
        </Link>
        <p className="text-xs text-gray-400 mt-4">Sin tarjeta. Sin instalación. Funciona en cualquier celular.</p>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-14">
            Cómo funciona
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                num: "1",
                title: "Cargás tu lista",
                desc: "Subís tu lista de precios en Excel. Queda guardada y lista para buscar al instante.",
                color: "bg-blue-500",
              },
              {
                num: "2",
                title: "Armás el pedido",
                desc: "Buscás productos por nombre o código, agregás cantidades, bonificaciones y descuentos.",
                color: "bg-emerald-500",
              },
              {
                num: "3",
                title: "Compartís",
                desc: "Enviás el pedido por WhatsApp, PDF con membrete o Excel — directo desde el celular.",
                color: "bg-violet-500",
              },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div
                  className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg`}
                >
                  <span className="text-white font-black text-xl">{step.num}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-14">
          Todo lo que necesitás
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {[
            { icon: "🔍", title: "Búsqueda inteligente", desc: "Encontrá cualquier producto escribiendo parte del nombre, aunque no sepas bien cómo se llama." },
            { icon: "📄", title: "PDF con membrete", desc: "El PDF incluye tu logo, nombre del comercio, vendedor y datos del cliente automáticamente." },
            { icon: "💬", title: "Compartir por WhatsApp", desc: "Con un tap mandás el pedido completo formateado por WhatsApp." },
            { icon: "📊", title: "Export a Excel", desc: "Exportá y compartí el pedido en Excel, listo para usar en cualquier dispositivo." },
            { icon: "👤", title: "Historial por cliente", desc: "Todos tus pedidos guardados, organizados por cliente, con detalle de cada ítem." },
            { icon: "📱", title: "Funciona offline", desc: "Instalala como app en tu celular. No necesitás conexión para buscar productos." },
          ].map((f) => (
            <div key={f.title} className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-colors">
              <span className="text-2xl mt-0.5">{f.icon}</span>
              <div>
                <h3 className="font-bold mb-1">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PARA QUIÉN */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-6">¿Para quién es?</h2>
          <p className="text-gray-500 mb-10 text-base leading-relaxed">
            Mayolista-OK es ideal para vendedores, representantes comerciales y distribuidores
            que trabajan con listas de precios de mayoristas o fábricas en Latinoamérica.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Vendedores de ruta", "Representantes comerciales", "Distribuidores", "Revendedores", "Agentes de ventas", "Despachantes"].map((tag) => (
              <span key={tag} className="bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-black mb-4">
          Empezá hoy, es gratis
        </h2>
        <p className="text-gray-500 mb-10 text-base max-w-md mx-auto">
          Cargá tu lista de precios y tomá tu primer pedido en menos de 5 minutos.
        </p>
        <Link
          href="/"
          className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-10 py-4 rounded-2xl text-lg transition-colors shadow-lg shadow-emerald-200"
        >
          Crear mi cuenta gratis →
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-8 px-6 text-center text-gray-400 text-xs">
        <p>© 2026 Mayolista-OK · Hecho para vendedores de Latinoamérica</p>
      </footer>
    </main>
  );
}
