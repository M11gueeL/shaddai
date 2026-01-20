import React, { useState, useEffect } from 'react';
import { Award, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import specialtiesApi from '../../../api/specialties';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import SpecialtiesTable from './SpecialtiesTable';
import SpecialtyForm from './SpecialtyForm';

export default function SpecialtiesPanel() {
    const [specialties, setSpecialties] = useState([]);
    const [filteredSpecialties, setFilteredSpecialties] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Estados del Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSpecialty, setCurrentSpecialty] = useState(null);

    const { show } = useToast();
    const { confirm } = useConfirm();


    useEffect(() => {
        fetchData();
    }, []);

    // Filtro de búsqueda y Reset de Paginación
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredSpecialties(specialties);
        } else {
            const lowerTerm = searchTerm.toLowerCase();
            const filtered = specialties.filter(item => 
                item.name.toLowerCase().includes(lowerTerm)
            );
            setFilteredSpecialties(filtered);
        }
        setCurrentPage(1); // Volver a la página 1 al filtrar
    }, [searchTerm, specialties]);

    // Calcular datos paginados
    const totalPages = Math.ceil(filteredSpecialties.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSpecialties.slice(indexOfFirstItem, indexOfLastItem);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await specialtiesApi.getAll();
            const data = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
            // Ordenar alfabéticamente por defecto
            const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
            setSpecialties(sortedData);
            setFilteredSpecialties(sortedData);
        } catch (error) {
            console.error(error);
            show('Error al cargar especialidades', { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (specialty = null) => {
        setCurrentSpecialty(specialty);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentSpecialty(null);
    };

    const handleSave = async (formData) => {
        try {
            let res;
            if (currentSpecialty) {
                res = await specialtiesApi.update(currentSpecialty.id, formData);
            } else {
                res = await specialtiesApi.create(formData);
            }

            if (res.success || res.data || res.id) {
                show(currentSpecialty ? 'Especialidad actualizada' : 'Especialidad creada', { variant: 'success' });
                handleCloseModal();
                fetchData();
            } else {
                show('No se pudo guardar la especialidad', { variant: 'error' });
            }
        } catch (error) {
            console.error(error);
            show('Error de servidor', { variant: 'error' });
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirm({
            title: 'Eliminar Especialidad',
            message: '¿Está seguro de que desea eliminar esta especialidad? Esta acción no se puede deshacer.',
            tone: 'danger', // Usar 'tone' en lugar de 'variant' según tu ConfirmContext
            confirmText: 'Eliminar',
            cancelText: 'Cancelar'
        });

        if (isConfirmed) {
            try {
                await specialtiesApi.delete(id);
                show('Especialidad eliminada correctamente', { variant: 'success' });
                fetchData();
            } catch (error) {
                console.error(error);
                show('Error al eliminar la especialidad', { variant: 'error' });
            }
        }
    };

    return (
        <div className="animate-in fade-in zoom-in-95 duration-300">
            {/* Header de Sección */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        Gestión de Especialidades
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Define las áreas médicas disponibles en la clínica.
                    </p>
                </div>
                
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-sm font-medium transition-all duration-200 flex items-center gap-2 hover:-translate-y-0.5"
                >
                    <Plus size={20} />
                    <span>Nueva Especialidad</span>
                </button>
            </div>

            {/* Barra de Búsqueda */}
            <div className="bg-white p-4 border border-gray-200 rounded-xl mb-6 shadow-sm">
                <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="text-gray-400 w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar especialidad..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition outline-none text-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabla con Paginación */}
            <SpecialtiesTable 
                data={currentItems} 
                isLoading={isLoading}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
                // Props de paginación
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredSpecialties.length}
            />

            {/* Formulario Modal */}
            {isModalOpen && (
                <SpecialtyForm 
                    initialData={currentSpecialty}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}