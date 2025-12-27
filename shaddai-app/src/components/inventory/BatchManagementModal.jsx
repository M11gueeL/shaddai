import React, { useState, useEffect } from 'react';
import { X, Trash2, AlertTriangle, CheckCircle, Clock, Package, Archive } from 'lucide-react';
import { getBatches, discardBatch } from '../../api/inventoryApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function BatchManagementModal({ item, onClose, onUpdate }) {
  const { token } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (item && token) {
        fetchBatches();
    }
  }, [item, token]);

  const fetchBatches = async () => {
    try {
      const res = await getBatches(item.id, token); 
      setBatches(res.data || []);
    } catch (error) {
      toast.error("Error cargando lotes");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = async (batchId, maxQty) => {
    // Prompt simple para cantidad (podrías hacer un modal interno más bonito)
    const qtyStr = prompt(`¿Cuántas unidades vas a desechar por vencimiento/daño? (Máx: ${maxQty})`, maxQty);
    if (!qtyStr) return;
    
    const qty = parseInt(qtyStr);
    if (isNaN(qty) || qty <= 0 || qty > maxQty) {
      toast.error("Cantidad inválida");
      return;
    }

    if(!window.confirm(`¿Confirmas dar de baja ${qty} unidades de este lote? Quedará registrado como pérdida.`)) return;

    try {
      await discardBatch({
        batch_id: batchId,
        quantity: qty,
        reason: 'Vencimiento'
      }, token);
      toast.success("Unidades dadas de baja");
      fetchBatches();
      onUpdate();
    } catch (error) {
      toast.error("Error al procesar la baja");
    }
  };

  const getStatusColor = (batch) => {
    // Prioridad 1: ¿Está vacío?
    if (batch.quantity === 0) return { bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-500', label: 'AGOTADO/CERRADO', icon: <Archive size={14}/> };
    
    // Prioridad 2: Fechas
    const days = Math.ceil((new Date(batch.expiration_date) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (days < 0) return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'VENCIDO', icon: <AlertTriangle size={14}/> };
    if (days < 30) return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', label: 'POR VENCER', icon: <Clock size={14}/> };
    return { bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-700', label: 'ACTIVO', icon: <CheckCircle size={14}/> };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="text-indigo-600" /> Gestión de Lotes
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Producto: <span className="font-medium text-gray-900">{item.name}</span> | Stock Total: {item.stock_quantity}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          {loading ? (
            <div className="flex justify-center py-10"><Clock className="animate-spin text-indigo-600"/></div>
          ) : batches.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
              <Package size={48} className="mx-auto text-gray-300 mb-3"/>
              <p className="text-gray-500 font-medium">No hay historial de lotes para este producto.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {batches.map(batch => {
                const style = getStatusColor(batch);
                // Calcular progreso: (Actual / Inicial) * 100
                const initial = batch.initial_quantity || batch.quantity; // Fallback
                const percentage = Math.round((batch.quantity / initial) * 100);
                
                return (
                  <div key={batch.id} className={`group relative overflow-hidden rounded-xl border ${style.border} ${style.bg} transition-all hover:shadow-md`}>
                    
                    <div className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between relative z-10">
                      
                      {/* Info Principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-lg text-gray-800">
                            {batch.batch_number || 'Sin Número'}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 border bg-white/80 ${style.text}`}>
                            {style.icon} {style.label}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 flex gap-4">
                          <span>Vence: <strong>{batch.expiration_date}</strong></span>
                          <span className="text-gray-400">|</span>
                          <span>Entrada: <strong>{batch.created_at?.substring(0,10)}</strong></span>
                        </div>
                      </div>

                      {/* Barra de Estadísticas Visual */}
                      <div className="flex-1 w-full sm:max-w-xs">
                        <div className="flex justify-between text-xs mb-1.5 font-medium text-gray-600">
                          <span>Disponible: {batch.quantity}</span>
                          <span>Inicial: {initial}</span>
                        </div>
                        <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${batch.quantity === 0 ? 'bg-gray-400' : 'bg-indigo-500'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-right text-[10px] text-gray-400 mt-1">
                          {percentage}% Remanente
                        </div>
                      </div>

                      {/* Acciones */}
                      {batch.quantity > 0 && (
                        <div className="flex items-center pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-gray-200/50 sm:pl-4 mt-2 sm:mt-0">
                          <button 
                            onClick={() => handleDiscard(batch.id, batch.quantity)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-100 rounded-lg hover:bg-red-50 hover:border-red-200 transition shadow-sm w-full sm:w-auto justify-center"
                            title="Dar de baja unidades de este lote por vencimiento o daño"
                          >
                            <Trash2 size={16} /> 
                            <span>Dar de Baja</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}