// app/suscripciones/page.tsx
import PlanCard from '@/components/PlanCard';

export default function SuscripcionesPage() {
  const planes = [
    { title: "Básico", 
      price: "$0/mes", 
      features: ["1 Empresa","1 Colaborador", "Funcionalidades Generales"],
      dir: "/login"
    },
    { title: "Profesional", 
      price: "$169.99/mes -> 1.669,99/año", 
      features: ["5 Empresas","10 Colaboradores", "Funcionalidades Generales","Acceso a Roles", "Acceso a la IA"], 
      featured: true,
      dir: "/login" 
    },
    { title: "Empresarial", 
      price: "$549.99/mes -> 5.499,99/año", 
      features: ["Empresas ilimitadas", "Colaboradores ilimitados", "Todas las funcionalidades","Gestionar Roles", "Soporte 24/7"],
      dir: "/login" 
    },
  ];

  return (
    <main className="bg-green-50 min-h-screen">

      <section className="bg-green-600 text-white text-center py-20 px-4">
        <h1 className="text-5xl font-bold mb-4">LIBRO VIVO</h1>
        <p className="text-xl max-w-3xl mx-auto">
          Somos un equipo de estudiantes apasionados por la tecnología, dedicado al desarrollo de software para simplificar la gestión de tu empresa.
          En esta plataforma, encontrarás herramientas diseñadas para facilitar la contabilidad y administración de tu negocio.
        </p>
      </section>

      {/* mision */}
      <section className="py-20 px-4 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-4xl font-bold mb-4 text-green-900">Nuestra Misión</h2>
          <p className="text-lg mb-6 text-green-800">
            Proporcionar una herramienta de contabilidad fácil de usar, potente y accesible para empresas de todos los tamaños.
          </p>
          <p className="text-lg text-green-800">
            Ofrecemos una plataforma que cumple con normativas y brinda una visión clara de la salud financiera de tu negocio.
          </p>
        </div>
        <div>
          <img src="/estadistica.svg" alt="Equipo" className="rounded-lg shadow-lg" />
        </div>
      </section>

      {/* ofrecemos */}
      <section className="bg-green-100 py-20 px-4">
        <div className="text-center max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-green-900">Ofrecemos</h2>
          <div className="grid md:grid-cols-3 gap-8">

            <div className="bg-white p-8 rounded-lg shadow-md">
              <img src="/balance.svg" alt="Contabilidad" className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2 text-green-700">Contabilidad Integral</h3>
              <p>Gestiona tus asientos contables, plan de cuentas, libros diarios y mayores de forma fácil.</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <img src="/report.svg" alt="Reportes" className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2 text-green-700">Reportes</h3>
              <p>Genera todos los reportes escenciales de la contabilidad.</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <img src="/teamS.svg" alt="Colaboración" className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2 text-green-700">Colaboración en Equipo</h3>
              <p>Invita a colaboradores, asigna roles y permisos para trabajar de forma segura y coordinada.</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <img src="/ai.svg" alt="Colaboración" className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2 text-green-700">Powered by AI</h3>
              <p>Soporte con Inteligencia Artificial.</p>
            </div>

          </div>
        </div>
      </section>

      {/* planes */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12 text-green-900">Planes de Suscripción</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {planes.map((plan, idx) => (
              <PlanCard
                key={idx}
                title={plan.title}
                price={plan.price}
                features={plan.features}
                featured={plan.featured}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}