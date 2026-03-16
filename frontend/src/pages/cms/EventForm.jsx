import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { categoriesApi } from '../../services/api';

const blankForm = {
  title: '', description: '', category_id: '',
  starts_at: '', ends_at: '', ticket_price: '',
  capacity: '', venue_name: '', venue_address: '',
  city: '', country: '', cover_image: '', video_url: '',
  is_featured: false, terms_and_conditions: '',
};

const EventForm = () => {
  const { id } = useParams();          // undefined = create mode
  const navigate = useNavigate();
  const [form, setForm]       = useState(blankForm);
  const [cats, setCats]       = useState([]);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

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
            title:                ev.title ?? '',
            description:          ev.description ?? '',
            category_id:          ev.category_id ?? '',
            starts_at:            ev.starts_at ? ev.starts_at.slice(0, 16) : '',
            ends_at:              ev.ends_at   ? ev.ends_at.slice(0, 16)   : '',
            ticket_price:         ev.ticket_price ?? '',
            capacity:             ev.capacity ?? '',
            venue_name:           ev.venue_name ?? '',
            venue_address:        ev.venue_address ?? '',
            city:                 ev.city ?? '',
            country:              ev.country ?? '',
            cover_image:          ev.cover_image ?? '',
            video_url:            ev.video_url ?? '',
            is_featured:          !!ev.is_featured,
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

  // Upload a local file to the backend and return the public URL
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

  // A field that uploads media from device only.
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

        <p className="text-xs text-gray-500">
          Upload from your device. URL input is disabled.
        </p>

        {uploadErr && <p className="text-xs text-red-500">{uploadErr}</p>}

        {/* Preview */}
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

  const Field = ({ label, children, required }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );

  const input = (field, type = 'text', { placeholder, required } = {}) => (
    <input
      type={type}
      required={required}
      placeholder={placeholder}
      value={form[field]}
      onChange={set(field)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{id ? 'Edit Event' : 'New Event'}</h1>

      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        {/* Basic */}
        <Field label="Title" required>{input('title', 'text', { required: true })}</Field>
        <Field label="Description">
          <textarea
            rows={4}
            value={form.description}
            onChange={set('description')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Category">
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
          </Field>
          <Field label="Ticket Price ($)" required>{input('ticket_price', 'number', { required: true })}</Field>
          <Field label="Capacity">{input('capacity', 'number')}</Field>
        </div>

        {/* Media */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <MediaField label="Cover Image" field="cover_image" accept="image/*" type="image" />
          <MediaField label="Promo Video" field="video_url" accept="video/*" type="video" />
        </div>

        {/* Date/times */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Start Date &amp; Time" required>{input('starts_at', 'datetime-local', { required: true })}</Field>
          <Field label="End Date &amp; Time">{input('ends_at', 'datetime-local')}</Field>
        </div>

        {/* Venue */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Venue Name">{input('venue_name')}</Field>
          <Field label="City">{input('city')}</Field>
          <Field label="Country">{input('country')}</Field>
          <Field label="Venue Address">{input('venue_address')}</Field>
        </div>

        {/* Terms */}
        <Field label="Terms &amp; Conditions">
          <textarea
            rows={3}
            value={form.terms_and_conditions}
            onChange={set('terms_and_conditions')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Field>

        {/* Featured */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={set('is_featured')}
            className="w-4 h-4 text-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Mark as Featured</span>
        </label>

        {/* Actions */}
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
