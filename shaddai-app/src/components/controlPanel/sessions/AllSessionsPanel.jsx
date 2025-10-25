import React, { useEffect, useMemo, useState } from 'react';
import { FiFilter, FiSearch } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import { getSessions } from '../../../api/authApi';

export default function AllSessionsPanel() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [filters, setFilters] = useState({
    status: '', // '', 'active', 'closed'
    from: '', // yyyy-mm-dd
    to: '',   // yyyy-mm-dd
  });

  useEffect(() => {
    let isMounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getSessions(token);
        const data = res?.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.sessions)
              ? data.sessions
              : [];
        if (isMounted) {
          setSessions(list);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Error al cargar sesiones');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (token) fetch();
    return () => { isMounted = false; };
  }, [token]);

  // Helper to parse date string safely
  const toDate = (s) => {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d) ? null : d;
  };

  useEffect(() => {
    let result = sessions || [];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (searchField !== 'all') {
        result = result.filter((row) => {
          switch (searchField) {
            case 'session_id':
              return String(row.id || '').toLowerCase().includes(term);
            case 'user_id':
              return String(row.user_id || '').toLowerCase().includes(term);
            case 'email':
              return (row.email || '').toLowerCase().includes(term);
            case 'ip':
              return (row.ip_address || '').toLowerCase().includes(term);
            case 'device':
              return (row.device_info || '').toLowerCase().includes(term);
            case 'status':
              return (row.session_status || '').toLowerCase().includes(term);
            default:
              return true;
          }
        });
      } else {
        result = result.filter((row) =>
          (String(row.id || '').toLowerCase().includes(term)) ||
          (String(row.user_id || '').toLowerCase().includes(term)) ||
          ((row.email || '').toLowerCase().includes(term)) ||
          ((row.ip_address || '').toLowerCase().includes(term)) ||
          ((row.device_info || '').toLowerCase().includes(term)) ||
          ((row.session_status || '').toLowerCase().includes(term))
        );
      }
    }

    // Filters
    if (filters.status) {
      if (filters.status === 'active') {
        result = result.filter((r) => (r.session_status || '').toLowerCase() === 'active' || (!r.logout_time));
      } else if (filters.status === 'closed') {
        result = result.filter((r) => (r.session_status || '').toLowerCase() === 'closed' || !!r.logout_time);
      }
    }

    if (filters.from) {
      const fromDate = new Date(filters.from + 'T00:00:00');
      result = result.filter((r) => {
        const d = toDate(r.login_time);
        return d ? d >= fromDate : true;
        
      });
    }

    if (filters.to) {
      const toDateObj = new Date(filters.to + 'T23:59:59');
      result = result.filter((r) => {
        const d = toDate(r.login_time);
        return d ? d <= toDateObj : true;
      });
    }

    setFiltered(result);
  }, [sessions, searchTerm, searchField, filters]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Sesiones de Usuarios</h2>

      <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1 flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar sesiones..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <select
                className="appearance-none w-full border border-l-0 border-gray-300 rounded-r-lg pl-3 pr-8 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
              >
                <option value="all">Todos los campos</option>
                <option value="user_id">ID Usuario</option>
                <option value="email">Email</option>
                <option value="ip">IP</option>
                <option value="device">Dispositivo</option>
                <option value="status">Estado</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <select
                className="appearance-none w-full border border-gray-300 rounded-lg pl-3 pr-8 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="">Todos</option>
                <option value="active">Activas</option>
                <option value="closed">Cerradas</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Desde</label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Hasta</label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
              />
            </div>

            {(filters.status || filters.from || filters.to) && (
              <button
                onClick={() => setFilters({ status: '', from: '', to: '' })}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 border-b border-red-200">{error}</div>
        )}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando sesiones...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Usuario</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispositivo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingreso</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logout</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">No se encontraron sesiones</td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">{s.user_id}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 break-all">{s.email}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{s.ip_address}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{s.device_info}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{s.login_time}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          s.logout_time ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {s.logout_time ? 'Cerrada' : 'Activa'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{s.logout_time || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
