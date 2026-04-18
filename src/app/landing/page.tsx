import Link from "next/link";

export const metadata = {
  title: "Mayolista-OK | Tomá pedidos como un profesional",
  description: "La app para vendedores y distribuidores de Latinoamérica. Cargá tu lista, armá pedidos y compartí por WhatsApp en segundos.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <span className="text-white font-black text-sm">M</span>
          </div>
          <span className="font-bold text-base tracking-tight">Mayolista-OK</span>
        </div>
        <Link
          href="/"
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-5 py-2 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20"
        >
          Empezar gratis →
        </Link>
      </nav>

      {/* HERO */}
      <section className="relative pt-36 pb-28 px-6 text-center overflow-hidden">
        {/* glow background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-4 py-2 rounded-full mb-8 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Para vendedores que quieren crecer
          </div>

          <h1 className="text-5xl sm:text-6xl font-black leading-[1.05] mb-6 tracking-tight">
            Dejá de perder ventas<br />
            <span className="text-emerald-400">por no tener el precio</span>
          </h1>

          <p className="text-xl text-white/50 mb-10 max-w-xl mx-auto leading-relaxed">
            Tu lista de precios siempre en el celular. Pedidos en 30 segundos.
            PDF con tu logo listo para enviar por WhatsApp.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/"
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-4 rounded-2xl text-lg transition-all shadow-2xl shadow-emerald-500/30 w-full sm:w-auto"
            >
              Empezar gratis ahora →
            </Link>
            <span className="text-white/30 text-sm">Sin tarjeta · Sin instalación · 2 minutos</span>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="py-20 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/40 text-sm uppercase tracking-widest font-semibold mb-6">¿Te suena familiar?</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { emoji: "📋", text: "\"Esperate que busco el precio en el Excel...\"" },
              { emoji: "😤", text: "\"Se me perdió el papel con el pedido\"" },
              { emoji: "⏰", text: "\"Tardé 20 minutos en armar la nota de pedido\"" },
            ].map((item) => (
              <div key={item.text} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
                <div className="text-3xl mb-3">{item.emoji}</div>
                <p className="text-white/70 text-sm italic leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
          <p className="text-emerald-400 font-bold text-xl mt-10">
            Con Mayolista-OK eso se termina.
          </p>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-white/40 text-sm uppercase tracking-widest font-semibold mb-3">Así de simple</p>
            <h2 className="text-4xl font-black">3 pasos, 30 segundos</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 relative">
            {/* línea conectora */}
            <div className="hidden sm:block absolute top-8 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

            {[
              { num: "01", title: "Cargás tu lista", desc: "Subís tu Excel con los precios del mayorista. Un solo archivo, queda guardado para siempre.", color: "from-blue-500 to-blue-600" },
              { num: "02", title: "Armás el pedido", desc: "Buscás por nombre o código. Agregás cantidades, kilos, litros, bonificaciones y descuentos.", color: "from-emerald-500 to-emerald-600" },
              { num: "03", title: "Compartís al instante", desc: "PDF con tu logo, WhatsApp, Excel o email. Directo desde el celular, sin pasar por la computadora.", color: "from-violet-500 to-violet-600" },
            ].map((step) => (
              <div key={step.num} className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-5 shadow-lg`}>
                  <span className="text-white font-black text-sm">{step.num}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black mb-3">Todo lo que necesitás, nada que no necesitás</h2>
            <p className="text-white/40">Diseñado para vendedores, no para técnicos.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "🔍", title: "Búsqueda inteligente", desc: "Escribís \"gallet\" y aparece todo. No importa si no sabés el nombre exacto." },
              { icon: "⚖️", title: "Kilos y litros", desc: "88,5 kg de asado, 1 y medio litro de aceite. La app entiende decimales y fracciones." },
              { icon: "📄", title: "PDF profesional", desc: "Con tu logo, nombre del comercio, cliente y fecha. Listo para enviar en segundos." },
              { icon: "💬", title: "WhatsApp directo", desc: "Un toque y el pedido formateado va al WhatsApp del cliente. Sin copiar ni pegar." },
              { icon: "📊", title: "Historial completo", desc: "Todos tus pedidos por cliente y fecha. Tocás uno y ves el detalle completo." },
              { icon: "📱", title: "Funciona sin internet", desc: "Instalala en el celular como app. La lista de precios queda guardada offline." },
            ].map((f) => (
              <div key={f.title} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-emerald-500/30 transition-colors group">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-bold mb-1.5 group-hover:text-emerald-400 transition-colors">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARA QUIÉN */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/40 text-sm uppercase tracking-widest font-semibold mb-4">¿Sos de los nuestros?</p>
          <h2 className="text-4xl font-black mb-4">Hecho para quien vende en la calle</h2>
          <p className="text-white/50 mb-10 leading-relaxed max-w-xl mx-auto">
            Si salís todos los días a visitar clientes con una lista de precios en el bolsillo,
            esta app es tuya. Sin complicaciones, sin cursos, sin técnicos.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Vendedor de ruta", "Representante comercial", "Distribuidor", "Agente de ventas", "Revendedor", "Carnicería", "Frigorífico", "Química", "Almacén mayorista"].map((tag) => (
              <span key={tag} className="bg-white/5 border border-white/10 text-white/60 text-sm px-4 py-1.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIO PLACEHOLDER */}
      <section className="py-16 px-6 bg-emerald-500/5 border-y border-emerald-500/10">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-3xl font-black text-emerald-400 mb-4">&ldquo;</p>
          <p className="text-xl text-white/80 italic leading-relaxed mb-6">
            Antes tardaba media hora en armar un pedido grande y lo enviaba por foto.
            Ahora en 3 minutos tengo el PDF listo y el cliente lo recibe por WhatsApp.
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              H
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Vendedor mayorista</p>
              <p className="text-white/40 text-xs">Buenos Aires, Argentina</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-28 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full bg-emerald-500/8 blur-[100px]" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-5xl font-black mb-4 leading-tight">
            Tu próxima venta<br />
            <span className="text-emerald-400">empieza hoy</span>
          </h2>
          <p className="text-white/50 mb-10 text-lg">
            Gratis. En el celular. Sin burocracia.
          </p>
          <Link
            href="/"
            className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-black px-12 py-5 rounded-2xl text-xl transition-all shadow-2xl shadow-emerald-500/30"
          >
            Crear mi cuenta gratis →
          </Link>
          <p className="text-white/20 text-xs mt-5">
            Mayolista-OK · Para vendedores de Latinoamérica
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-white/20 text-xs">
        © 2026 Mayolista-OK
      </footer>
    </main>
  );
}
