export default function PaymentAudit() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-purple-700 mb-4">Auditoría de Pagos</h1>
      <p className="text-gray-600 mb-6">
        Información confidencial de transacciones, historial completo y reportes financieros.
      </p>
      <div className="bg-purple-100 border border-purple-400 text-purple-700 px-4 py-3 rounded relative w-full">
        <strong>Acceso Exclusivo:</strong> Solo Administradores
      </div>
    </div>
  );
}