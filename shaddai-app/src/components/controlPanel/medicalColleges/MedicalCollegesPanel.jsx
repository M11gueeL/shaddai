import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search } from 'lucide-react';
import medicalCollegesApi from '../../../api/medicalColleges'; 
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import MedicalCollegesTable from './MedicalCollegesTable';
import MedicalCollegeForm from './MedicalCollegeForm';

export default function MedicalCollegesPanel() {
    const [colleges, setColleges] = useState([]);
    const [filteredColleges, setFilteredColleges] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Estados del Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCollege, setCurrentCollege] = useState(null);

    const { show } = useToast();
    const { confirm } = useConfirm();

    useEffect(() => {
        fetchData();
    }, []);

    // Filtro y Reset Paginación
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredColleges(colleges);
        } else {
            const lowerTerm = searchTerm.toLowerCase();
            const filtered = colleges.filter(item => 
                (item.state_name && item.state_name.toLowerCase().includes(lowerTerm)) ||
                (item.full_name && item.full_name.toLowerCase().includes(lowerTerm)) ||
                (item.abbreviation && item.abbreviation.toLowerCase().includes(lowerTerm))
            );
            setFilteredColleges(filtered);
        }
        setCurrentPage(1);
    }, [searchTerm, colleges]);

    // Lógica de Paginación
    const totalPages = Math.ceil(filteredColleges.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredColleges.slice(indexOfFirstItem, indexOfLastItem);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await medicalCollegesApi.getAll();
            const data = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
            
            // Ordenar por nombre del estado
            const sortedData = data.sort((a, b) => {
                const stateA = a.state_name || '';
                const stateB = b.state_name || '';
                return stateA.localeCompare(stateB);
            });

            setColleges(sortedData);
            setFilteredColleges(sortedData);
        } catch (error) {
            console.error(error);
            show('Error al cargar colegios médicos', { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (college = null) => {
        setCurrentCollege(college);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentCollege(null);
    };

    const handleSave = async (formData) => {
        try {
            let res;
            if (currentCollege) {
                res = await medicalCollegesApi.update(currentCollege.id, formData);
            } else {
                res = await medicalCollegesApi.create(formData);
            }

            if (res.success || res.data || res.id) {
                show(currentCollege ? 'Colegio actualizado' : 'Colegio creado', { variant: 'success' });
                handleCloseModal();
                fetchData();
            } else {
                show('No se pudo guardar el registro', { variant: 'error' });
            }
        } catch (error) {
            console.error(error);
            show('Error de servidor', { variant: 'error' });
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirm({
            title: 'Eliminar Colegio Médico',
            message: '¿Está seguro de que desea eliminar este colegio médico? Esta acción no se puede deshacer.',
            tone: 'danger',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar'
        });

        if (isConfirmed) {
            try {
                await medicalCollegesApi.delete(id);
                show('Colegio médico eliminado correctamente', { variant: 'success' });
                fetchData();
            } catch (error) {
                console.error(error);
                show('Error al eliminar el registro', { variant: 'error' });
            }
        }
    };

    return (
        <div className="animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        Gestión de Colegios Médicos
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Administra el registro de colegios y asociaciones médicas.
                    </p>
                </div>
                
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-sm font-medium transition-all duration-200 flex items-center gap-2 hover:-translate-y-0.5"
                >
                    <Plus size={20} />
                    <span>Nuevo Colegio</span>
                </button>
            </div>

            {/* Buscador */}
            <div className="bg-white p-4 border border-gray-200 rounded-xl mb-6 shadow-sm">
                <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="text-gray-400 w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por estado o nombre..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition outline-none text-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabla */}
            <MedicalCollegesTable 
                data={currentItems} 
                isLoading={isLoading}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredColleges.length}
            />

            {/* Formulario */}
            {isModalOpen && (
                <MedicalCollegeForm 
                    initialData={currentCollege}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}