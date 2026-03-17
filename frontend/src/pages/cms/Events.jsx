import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';

const Events = () => {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [msg, setMsg]         = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getEvents({ search });
      const d = res.data.data ?? res.data;
      setEvents(Array.isArray(d) ? d : d.data ?? []);
    } catch {
      setMsg('Failed to load events.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handlePublish = async (id, isPublished) => {
    try {
      if (isPublished) {
        await adminApi.unpublishEvent(id);
      } else {
        await adminApi.publishEvent(id);
      }
      setMsg('Event updated.');
      load();
    } catch {
      setMsg('Failed to update event.');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteEvent(id);
      setMsg('Event deleted.');
      load();
    } catch {
      setMsg('Failed to delete event.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Events</h1>
        <Link
          to="/cms/events/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + New Event
        </Link>
      </div>

      {msg && (
        <div className="bg-blue-50 text-blue-700 text-sm px-4 py-2 rounded-lg">{msg}</div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Search events…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700">
          Search
        </button>
      </form>

      {loading ? (
        <p className="text-gray-400 animate-pulse">Loading…</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">No events found.</td>
                </tr>
              ) : events.map((ev) => (
                <tr key={ev.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px]">
                    <div className="truncate">{ev.title}</div>
                    {ev.is_featured && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">Featured</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{ev.category?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {ev.starts_at ? new Date(ev.starts_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">${ev.ticket_price}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      ev.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>{ev.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/cms/events/${ev.id}/edit`}
                        className="text-blue-600 hover:underline text-xs"
                      >Edit</Link>
                      <button
                        onClick={() => handlePublish(ev.id, ev.status === 'published')}
                        className="text-xs text-yellow-600 hover:underline"
                      >
                        {ev.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => handleDelete(ev.id, ev.title)}
                        className="text-xs text-red-600 hover:underline"
                      >Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Events;
