import { useState, useEffect } from 'react';
import { PlusCircle, Search, Edit2, Trash2, Tag, Check, X as XIcon } from 'lucide-react';
import CategoryService from '../../services/CategoryService';
import Swal from 'sweetalert2';

export default function CategoriesList() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        activa: true
    });

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await CategoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar las categorías',
                icon: 'error',
                background: '#151E32',
                color: '#fff'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Filter categories based on search
    const filteredCategories = categories.filter(cat =>
        cat.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingId(category.id);
            setFormData({
                nombre: category.nombre,
                activa: category.activa === 1 || category.activa === true
            });
        } else {
            setEditingId(null);
            setFormData({ nombre: '', activa: true });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ nombre: '', activa: true });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const dataToSend = {
                ...formData,
                activa: formData.activa ? 1 : 0
            };

            if (editingId) {
                await CategoryService.update(editingId, dataToSend);
                Swal.fire({
                    title: '¡Actualizada!',
                    text: 'La categoría ha sido actualizada con éxito',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#151E32',
                    color: '#fff'
                });
            } else {
                await CategoryService.create(dataToSend);
                Swal.fire({
                    title: '¡Creada!',
                    text: 'La categoría ha sido creada con éxito',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#151E32',
                    color: '#fff'
                });
            }

            handleCloseModal();
            fetchCategories(); // Refresh list

        } catch (error) {
            console.error('Error saving category:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Ocurrió un error al guardar la categoría',
                icon: 'error',
                background: '#151E32',
                color: '#fff'
            });
        }
    };

    const handleDelete = async (id, nombre) => {
        const result = await Swal.fire({
            title: '¿Eliminar Categoría?',
            html: `¿Estás seguro de eliminar la categoría <b>${nombre}</b>?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#151E32',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await CategoryService.delete(id);
                Swal.fire({
                    title: '¡Eliminada!',
                    text: 'Categoría eliminada con éxito',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#151E32',
                    color: '#fff'
                });
                fetchCategories();
            } catch (error) {
                console.error('Error deleting category:', error);

                // Usually fails if it has products attached
                Swal.fire({
                    title: 'No se pudo eliminar',
                    text: error.response?.data?.message || 'Es posible que esta categoría tenga productos asociados.',
                    icon: 'error',
                    background: '#151E32',
                    color: '#fff'
                });
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-sc-navy-card/80 p-6 rounded-2xl border border-white/5 shadow-lg">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Tag className="text-sc-magenta" />
                        Categorías
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">Gestiona la clasificación de tus productos.</p>
                </div>

                <div className="flex w-full sm:w-auto items-center gap-4">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar categoría..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-sc-navy/50 border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-sc-cyan/20 focus:border-sc-cyan outline-none transition-all text-sm"
                        />
                    </div>

                    <button
                        onClick={() => handleOpenModal()}
                        className="flex-shrink-0 bg-gradient-to-r from-sc-magenta to-purple-600 hover:to-purple-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-sc-magenta/20 hover:shadow-sc-magenta/40 hover:-translate-y-0.5"
                    >
                        <PlusCircle size={18} />
                        <span className="hidden sm:inline">Nueva</span>
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-sc-navy-card/80 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-sc-navy/50 border-b border-white/5">
                                <th className="p-4 text-sm font-semibold text-slate-300">ID</th>
                                <th className="p-4 text-sm font-semibold text-slate-300">Nombre</th>
                                <th className="p-4 text-sm font-semibold text-slate-300">Estado</th>
                                <th className="p-4 text-sm font-semibold text-slate-300 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center">
                                        <div className="flex justify-center items-center gap-3 text-slate-400">
                                            <div className="w-5 h-5 border-2 border-sc-cyan border-t-transparent rounded-full animate-spin"></div>
                                            Cargando categorías...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-400">
                                        No se encontraron categorías.
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((category) => (
                                    <tr key={category.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-4 text-sm text-slate-400">#{category.id}</td>
                                        <td className="p-4 text-sm font-bold text-white">
                                            {category.nombre}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${category.activa
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                }`}>
                                                {category.activa ? (
                                                    <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Activa</>
                                                ) : (
                                                    <><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Inactiva</>
                                                )}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(category)}
                                                    className="p-2 text-sc-cyan hover:bg-sc-cyan/10 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id, category.nombre)}
                                                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Create/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal}></div>

                    {/* Modal Content */}
                    <div className="relative bg-[#151E32] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <XIcon size={18} />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                {editingId ? <Edit2 className="text-sc-cyan" size={20} /> : <PlusCircle className="text-sc-magenta" size={20} />}
                                {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">
                                {editingId ? 'Modifica los datos de la categoría.' : 'Completa los datos para crear una nueva.'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nombre de la Categoría</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full bg-sc-navy/50 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-sc-cyan/20 focus:border-sc-cyan outline-none transition-all placeholder-slate-600"
                                    placeholder="Ej: Pizzas Clásicas"
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-sc-navy/30 rounded-xl border border-white/5">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.activa}
                                        onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sc-cyan"></div>
                                </label>
                                <div>
                                    <span className="block text-sm font-medium text-white">Estado Activo</span>
                                    <span className="block text-xs text-slate-400">Si se desactiva, no se mostrará a los clientes.</span>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-sc-magenta to-purple-600 hover:to-purple-500 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg shadow-sc-magenta/20"
                                >
                                    <Check size={18} />
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
