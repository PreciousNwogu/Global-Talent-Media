import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminApi, categoriesApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const blankForm = {
  title: '', description: '', category_id: '',
  starts_at: '', ends_at: '', ticket_price: '',
  capacity: '', venue_name: '', venue_address: '',
  city: '', country: '', cover_image: '', video_url: '',
  is_featured: false, terms_and_conditions: '',
};

const EventForm = () => {
  const { user } = useAuth();
  const canManage = !!user?.is_full_admin;
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(blankForm);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    categoriesApi.getAll().then((r) => {
      const d = r.data.data ?? r.data;
      setCats(Array.isArray(d) ? d : []);
    });

    if (id) {
      adminApi.getEvents().then((r) => {
        const all = r.data.data ?? r.data;
        const ev = (Array.isArray(all) ? all : all.data ?? []).find((e) => String(e.id) === id);
        if (ev) {
          setForm({
            title: ev.title ?? '',
            description: ev.description ?? '',
            category_id: ev.category_id ?? '',
            starts_at: ev.starts_at ? ev.starts_at.slice(0, 16) : '',
            ends_at: ev.ends_at ? ev.ends_at.slice(0, 16) : '',
            ticket_price: ev.ticket_price ?? '',
            capacity: ev.capacity ?? '',
            venue_name: ev.venue_name ?? '',
            venue_address: ev.venue_address ?? '',
            city: ev.city ?? '',
            country: ev.country ?? '',
            cover_image: ev.cover_image ?? '',
            video_url: ev.video_url ?? '',
            is_featured: !!ev.is_featured,
            terms_and_conditions: ev.terms_and_conditions ?? '',
          });
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [id]);

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const uploadFile = async (file, type = 'image') => {
    const token = localStorage.getItem('auth_token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const res = await fetch(`${baseUrl}/admin/upload`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'X-Upload-Type': type,
        'X-Filename': encodeURIComponent(file.name),
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    });

    const text = await res.text();
    let json;

    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(text.slice(0, 300) || 'Upload failed');
    }

    if (!res.ok) {
      const message = json.message ?? (json.errors ? Object.values(json.errors).flat().join(' ') : 'Upload failed');
      throw new Error(message);
    }

    return json.url;
  };

  const MediaField = ({ label, field, accept = 'image/*', type = 'image' }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadErr, setUploadErr] = useState('');

    const handleFile = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      setUploadErr('');
      try {
        const url = await uploadFile(file, type);
        setForm((prev) => ({ ...prev, [field]: url }));
      } catch (err) {
        setUploadErr(err.message || 'Upload failed. Check file size or try again.');
      } finally {
        setUploading(false);
      }
    };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept={accept}
            onChange={handleFile}
            className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100 cursor-pointer"
          />
          {uploading && <span className="text-xs text-blue-500 animate-pulse">Uploading…</span>}
        </div>

        <p className="text-xs text-gray-500">Upload from your device. URL input is disabled.</p>

        {uploadErr && <p className="text-xs text-red-500">{uploadErr}</p>}

        {form[field] && type === 'image' && (
          <img src={form[field]} alt="preview" className="mt-1 h-28 w-auto rounded-lg object-cover border border-gray-200" />
        )}
        {form[field] && type === 'video' && (
          <video src={form[field]} controls className="mt-1 h-28 w-auto rounded-lg border border-gray-200" />
        )}
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (id) {
        await adminApi.updateEvent(id, form);
      } else {
        await adminApi.createEvent(form);
      }
      navigate('/cms/events');
    } catch (err) {
      const errs = err.response?.data?.errors;
      if (errs) {
        setError(Object.values(errs).flat().join(' '));
      } else {
        setError(err.response?.data?.message ?? 'Failed to save event.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-400 animate-pulse">Loading event…</p>;

  if (!canManage) {
    return (
      <div className="max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">{id ? 'Edit Event' : 'New Event'}</h1>
        <div className="bg-yellow-50 text-yellow-800 text-sm px-4 py-3 rounded-lg">
          CMS admins have read-only access to events. Event creation, editing, publishing, and deletion are disabled here.
        </div>
        <Link to="/cms/events" className="inline-flex px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800">
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{id ? 'Edit Event' : 'New Event'}</h1>

      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500 ml-0.5">*</span></label>
          <input
            type="text"
            required
            value={form.title}
            onChange={set('title')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={set('description')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category_id}
              onChange={set('category_id')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select --</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Price ($) <span className="text-red-500 ml-0.5">*</span></label>
            <input
              type="number"
              required
              value={form.ticket_price}
              onChange={set('ticket_price')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input
              type="number"
              value={form.capacity}
              onChange={set('capacity')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <MediaField label="Cover Image" field="cover_image" accept="image/*" type="image" />
          <MediaField label="Promo Video" field="video_url" accept="video/*" type="video" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date &amp; Time <span className="text-red-500 ml-0.5">*</span></label>
            <input
              type="datetime-local"
              required
              value={form.starts_at}
              onChange={set('starts_at')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date &amp; Time</label>
            <input
              type="datetime-local"
              value={form.ends_at}
              onChange={set('ends_at')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name</label>
            <input
              type="text"
              value={form.venue_name}
              onChange={set('venue_name')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={form.city}
              onChange={set('city')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              value={form.country}
              onChange={set('country')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue Address</label>
            <input
              type="text"
              value={form.venue_address}
              onChange={set('venue_address')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Terms &amp; Conditions</label>
          <textarea
            rows={3}
            value={form.terms_and_conditions}
            onChange={set('terms_and_conditions')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={set('is_featured')}
            className="w-4 h-4 text-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Mark as Featured</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/cms/events')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : id ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;