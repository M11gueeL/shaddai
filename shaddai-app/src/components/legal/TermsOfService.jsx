import React from 'react';
import { Scale, FileCheck, AlertCircle, Copyright, HelpCircle } from 'lucide-react';
import ElegantHeader from '../common/ElegantHeader';

export default function TermsOfService() {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
      <ElegantHeader 
        icon={Scale}
        sectionName="Legal"
        title="Términos de"
        highlightText="Servicio"
        description="Condiciones de uso para el sistema de gestión del Centro de Especialidades Médicas Shaddai Rafa."
      />

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-10 space-y-8 text-gray-600 leading-relaxed">
          
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-500" />
              1. Aceptación de los Términos
            </h2>
            <p>
              Al acceder y utilizar el sistema de gestión del <strong>Centro de Especialidades Médicas Shaddai Rafa</strong>, usted acepta cumplir y estar sujeto a estos Términos de Servicio. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-500" />
              2. Uso del Servicio
            </h2>
            <p className="mb-3">Usted se compromete a utilizar el sistema únicamente para fines legales y autorizados, y acepta no:</p>
            <ul className="list-disc pl-5 space-y-2 marker:text-indigo-500">
              <li>Utilizar el servicio para cualquier propósito ilegal o no autorizado.</li>
              <li>Intentar acceder a áreas restringidas del sistema sin la debida autorización.</li>
              <li>Interferir o interrumpir la integridad o el rendimiento del sistema.</li>
              <li>Compartir sus credenciales de acceso con terceros.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Copyright className="w-5 h-5 text-indigo-500" />
              3. Propiedad Intelectual
            </h2>
            <p>
              El sistema, incluyendo su diseño, código fuente, logotipos y contenido, es propiedad exclusiva del Centro de Especialidades Médicas Shaddai Rafa y sus licenciantes, y está protegido por las leyes de propiedad intelectual y derechos de autor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-500" />
              4. Limitación de Responsabilidad
            </h2>
            <p>
              El Centro de Especialidades Médicas Shaddai Rafa no será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo la pérdida de beneficios, datos o uso, que surjan de o estén relacionados con su uso del sistema.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-500" />
              5. Modificaciones
            </h2>
            <p>
              Nos reservamos el derecho de modificar o reemplazar estos términos en cualquier momento. Es su responsabilidad revisar periódicamente estos términos para estar informado de cualquier cambio. El uso continuado del servicio después de cualquier modificación constituye la aceptación de los nuevos términos.
            </p>
          </section>

          <div className="pt-8 border-t border-gray-100">
            <p className="text-sm text-gray-500 italic">
              Última actualización: Diciembre 2025
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
