export default function PaymentOperations() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-indigo-700 mb-4">Operaciones de Caja</h1>
      <p className="text-gray-600 mb-6">
        Módulo para gestionar transacciones diarias, facturas y pagos de pacientes.
      </p>
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative w-full">
        <strong>Acceso:</strong> Recepcionistas y Administradores
      </div>
    </div>
  );
}