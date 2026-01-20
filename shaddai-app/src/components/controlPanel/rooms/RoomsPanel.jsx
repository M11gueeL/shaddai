import React, { useState, useEffect } from 'react';
import { DoorOpen, Plus, Search, Filter } from 'lucide-react';
import { getConsultingRooms, createConsultingRoom, updateConsultingRoom, deleteConsultingRoom } from '../../../api/consultingRooms';
import SpecialtiesApi from '../../../api/specialties';
import { useToast } from '../../../context/ToastContext';
import RoomsTable from './RoomsTable';
import RoomForm from './RoomForm';

export default function RoomsPanel() {
    const [rooms, setRooms] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRoom, setCurrentRoom] = useState(null);

    const { show } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    // Filter effect
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredRooms(rooms);
            return;
        }
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = rooms.filter(room => 
            room.name.toLowerCase().includes(lowerTerm) ||
            (room.description && room.description.toLowerCase().includes(lowerTerm))
        );
        setFilteredRooms(filtered);
    }, [searchTerm, rooms]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [roomsRes, specialtiesRes] = await Promise.all([
                getConsultingRooms(),
                SpecialtiesApi.getAll()
            ]);

            if (roomsRes) {
                 const data = Array.isArray(roomsRes.data) ? roomsRes.data : (Array.isArray(roomsRes) ? roomsRes : []);
                 setRooms(data);
                 setFilteredRooms(data);
            }
            
            const spex = specialtiesRes.data || specialtiesRes; 
            setSpecialties(Array.isArray(spex) ? spex : (spex.data || []));

        } catch (error) {
            console.error(error);
            show('Error al cargar datos', { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (room = null) => {
        setCurrentRoom(room);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentRoom(null);
    };

    const handleSave = async (formData) => {
        const payload = {
            ...formData,
            active: formData.active ? 1 : 0
        };

        try {
            let res;
            if (currentRoom) {
                res = await updateConsultingRoom(currentRoom.id, payload);
            } else {
                res = await createConsultingRoom(payload);
            }

            if (res.success || res.id) {
                show(currentRoom ? 'Consultorio actualizado' : 'Consultorio creado', { variant: 'success' });
                handleCloseModal();
                fetchData();
            } else {
                show(res.message || 'Error al guardar', { variant: 'error' });
            }
        } catch (error) {
            console.error(error);
            show('Error de servidor', { variant: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este consultorio?')) {
            try {
                const res = await deleteConsultingRoom(id);
                if (res.success) {
                    show('Consultorio eliminado', { variant: 'success' });
                    fetchData();
                } else {
                    show(res.message || 'Error al eliminar', { variant: 'error' });
                }
            } catch (error) {
                show('Error al eliminar', { variant: 'error' });
            }
        }
    };

    return (
        <div>
            {/* Header consistent with Users and Sessions (h2 + search bar block) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        Gestión de Consultorios
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Administra los espacios físicos y sus asignaciones.
                    </p>
                </div>
                
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-sm font-medium transition-all duration-200 flex items-center gap-2 transform hover:-translate-y-0.5"
                >
                    <Plus size={20} />
                    <span>Nuevo Consultorio</span>
                </button>
            </div>

            {/* Search Bar Block */}
            <div className="bg-white p-4 border border-gray-200 rounded-xl mb-6 shadow-sm">
                <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="text-gray-400 w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar consultorio por nombre o descripción..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition outline-none text-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Content */}
            <RoomsTable 
                rooms={filteredRooms} 
                specialties={specialties}
                isLoading={isLoading}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
            />

            {/* Modal Form */}
            {isModalOpen && (
                <RoomForm 
                    initialData={currentRoom}
                    specialties={specialties}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}
