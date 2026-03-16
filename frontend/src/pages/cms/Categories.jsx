import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';

const blankForm = { name: '', description: '', color: '#3B82F6', icon: '🎭' };

const Categories = () => {
  const [cats, setCats]         = useState([]);
  const [form, setForm]         = useState(blankForm);
  const [editing, setEditing]   = useState(null); // id being edited
  const [loading, setLoading]   = useState(true);
  const [msg, setMsg]           = useState({ text: '', type: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCategories();
      const d = res.data.data ?? res.data;
      setCats(Array.isArray(d) ? d : []);
    } catch {
      setMsg({ text: 'Failed to load categories.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const flash = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await adminApi.updateCategory(editing, form);
        flash('Category updated.');
        setEditing(null);
      } else {
        await adminApi.createCategory(form);
        flash('Category created.');
      }
      setForm(blankForm);
      load();
    } catch (err) {
      flash(err.response?.data?.message ?? 'Failed to save.', 'error');
    }
  };

  const startEdit = (cat) => {
    setEditing(cat.id);
    setForm({ name: cat.name, description: cat.description ?? '', color: cat.color ?? '#3B82F6', icon: cat.icon ?? '🎭' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await adminApi.deleteCategory(id);
      flash('Category deleted.');
      load();
    } catch (err) {
      flash(err.response?.data?.message ?? 'Cannot delete.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Categories</h1>

      {msg.text && (
        <div className={`text-sm px-4 py-2 rounded-lg ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {msg.text}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {editing ? 'Edit Category' : 'New Category'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
            <input
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="h-10 w-16 cursor-pointer rounded"
              />
            </div>
            <div className="flex gap-2 ml-auto">
              {editing && (
                <button
                  type="button"
                  onClick={() => { setEditing(null); setForm(blankForm); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                {editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-gray-400 animate-pulse">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cats.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
              <span className="text-2xl">{cat.icon ?? '🏷️'}</span>
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: cat.color ?? '#3B82F6' }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{cat.name}</p>
                {cat.description && (
                  <p className="text-xs text-gray-400 truncate">{cat.description}</p>
                )}
                {cat.events_count !== undefined && (
                  <p className="text-xs text-gray-300">{cat.events_count} events</p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => startEdit(cat)} className="text-xs text-blue-600 hover:underline">Edit</button>
                <button onClick={() => handleDelete(cat.id, cat.name)} className="text-xs text-red-600 hover:underline">Del</button>
              </div>
            </div>
          ))}
          {cats.length === 0 && (
            <p className="col-span-3 text-gray-400 text-sm">No categories yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Categories;
