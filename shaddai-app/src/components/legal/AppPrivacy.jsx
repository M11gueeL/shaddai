import React from 'react';
import { Shield, Lock, Eye, FileText, Server } from 'lucide-react';
import ElegantHeader from '../common/ElegantHeader';

export default function AppPrivacy() {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
      <ElegantHeader 
        icon={Shield}
        sectionName="Legal"
        title="Política de"
        highlightText="Privacidad"
        description="Su privacidad es importante para nosotros. Conozca cómo protegemos y gestionamos sus datos."
      />

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-10 space-y-8 text-gray-600 leading-relaxed">
          
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-500" />
              1. Introducción
            </h2>
            <p>
              En el <strong>Centro de Especialidades Médicas Shaddai Rafa</strong>, nos comprometemos a proteger la privacidad y seguridad de la información personal de nuestros pacientes y usuarios. Esta Política de Privacidad describe cómo recopilamos, utilizamos y protegemos su información al utilizar nuestro sistema de gestión médica.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-500" />
              2. Información que Recopilamos
            </h2>
            <p className="mb-3">Recopilamos información necesaria para brindar servicios médicos de calidad, incluyendo:</p>
            <ul className="list-disc pl-5 space-y-2 marker:text-indigo-500">
              <li><strong>Información Personal:</strong> Nombres, apellidos, cédula de identidad, fecha de nacimiento, dirección y datos de contacto.</li>
              <li><strong>Información Médica:</strong> Historial clínico, diagnósticos, tratamientos, recetas, resultados de exámenes y antecedentes familiares.</li>
              <li><strong>Información de Uso:</strong> Datos sobre cómo interactúa con nuestra plataforma, registros de acceso y preferencias del sistema.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-500" />
              3. Uso de la Información
            </h2>
            <p>Utilizamos su información exclusivamente para los siguientes fines:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3 marker:text-indigo-500">
              <li>Proporcionar atención médica y seguimiento clínico adecuado.</li>
              <li>Gestionar citas, recordatorios y comunicaciones relacionadas con su salud.</li>
              <li>Administrar facturación, pagos y procesos administrativos.</li>
              <li>Mejorar la calidad de nuestros servicios y la seguridad de la plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-500" />
              4. Protección de Datos
            </h2>
            <p>
              Implementamos medidas de seguridad técnicas, administrativas y físicas robustas para proteger su información contra acceso no autorizado, alteración, divulgación o destrucción. Utilizamos encriptación de datos, controles de acceso estrictos y auditorías regulares de seguridad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              5. Sus Derechos
            </h2>
            <p>
              Usted tiene derecho a acceder, corregir o solicitar la eliminación de su información personal, sujeto a las obligaciones legales de retención de registros médicos. Para ejercer estos derechos, por favor contacte a nuestra administración.
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
