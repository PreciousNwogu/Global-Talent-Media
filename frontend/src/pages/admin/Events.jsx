import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, categoriesApi, uploadApi } from '../../services/api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category_id: '', search: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    category_id: '',
    location: '',
    venue_address: '',
    starts_at: '',
    ends_at: '',
    cover_image: '',
    video_url: '',
    price: '',
    capacity: '',
    is_featured: false,
    status: 'draft',
  });

  useEffect(() => {
    loadEvents();
    loadCategories();
  }, [filters]);

  const loadEvents = async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.search) params.search = filters.search;

      const response = await adminApi.getAllEvents(params);
      setEvents(response.data.data || response.data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data.data || response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    // Check file extension (more reliable than MIME type)
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      alert(`Invalid file type. Please select a JPEG, PNG, GIF, WEBP, or BMP image.\n\nYour file: ${file.name}\nValid extensions: ${validExtensions.join(', ')}`);
      return;
    }
    
    // Basic client-side validation for MIME type (but don't block if extension is valid)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/x-png', 'image/pjpeg'];
    if (file.type && !validTypes.includes(file.type)) {
      console.warn('File MIME type is ' + file.type + ' but extension looks valid, proceeding...');
      // Don't block - let server validate
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('File is too large. Maximum size is 5MB.');
      return;
    }
    
    setUploadingImage(true);
    try {
      const response = await uploadApi.uploadImage(file);
      console.log('Upload response:', response.data);
      const imageUrl = response.data.url;
      setFormData({ ...formData, cover_image: imageUrl });
      setImagePreview(imageUrl);
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      
      // Extract the error message
      let errorMessage = 'Error uploading image. Please try again.';
      
      if (error.response?.data) {
        // Try to get the validation error message
        if (error.response.data.errors?.image) {
          const imageErrors = error.response.data.errors.image;
          errorMessage = Array.isArray(imageErrors) 
            ? imageErrors[0] 
            : imageErrors;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        
        // Log full error for debugging
        console.error('Full error details:', JSON.stringify(error.response.data, null, 2));
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await adminApi.updateEvent(editingEvent.id, formData);
      } else {
        await adminApi.createEvent(formData);
      }
      setShowModal(false);
      setEditingEvent(null);
      resetForm();
      setImagePreview(null);
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event. Please check the console.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await adminApi.deleteEvent(id);
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event.');
    }
  };

  const handlePublish = async (id) => {
    try {
      await adminApi.publishEvent(id);
      loadEvents();
    } catch (error) {
      console.error('Error publishing event:', error);
    }
  };

  const handleUnpublish = async (id) => {
    try {
      await adminApi.unpublishEvent(id);
      loadEvents();
    } catch (error) {
      console.error('Error unpublishing event:', error);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    const coverImage = event.cover_image || '';
    setFormData({
      title: event.title || '',
      description: event.description || '',
      short_description: event.short_description || '',
      category_id: event.category_id || '',
      location: event.location || '',
      venue_address: event.venue_address || '',
      starts_at: event.starts_at ? new Date(event.starts_at).toISOString().slice(0, 16) : '',
      ends_at: event.ends_at ? new Date(event.ends_at).toISOString().slice(0, 16) : '',
      cover_image: coverImage,
      video_url: event.video_url || '',
      price: event.price || '',
      capacity: event.capacity || '',
      is_featured: event.is_featured || false,
      status: event.status || 'draft',
    });
    setImagePreview(coverImage);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      short_description: '',
      category_id: '',
      location: '',
      venue_address: '',
      starts_at: '',
      ends_at: '',
      cover_image: '',
      video_url: '',
      price: '',
      capacity: '',
      is_featured: false,
      status: 'draft',
    });
    setEditingEvent(null);
    setImagePreview(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      sold_out: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || colors.draft;
  };

  if (loading) {
    return <div className="text-center py-8">Loading events...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search events..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="border rounded-lg px-3 py-2"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="cancelled">Cancelled</option>
          <option value="sold_out">Sold Out</option>
        </select>
        <select
          value={filters.category_id}
          onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{event.title}</div>
                  {event.is_featured && (
                    <span className="text-xs text-indigo-600">⭐ Featured</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {event.category?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(event.starts_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  £{parseFloat(event.price).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    {event.status === 'published' ? (
                      <button
                        onClick={() => handleUnpublish(event.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Unpublish
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePublish(event.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingEvent ? 'Edit Event' : 'Create Event'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Short Description</label>
                <textarea
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                  rows="4"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Venue Address</label>
                  <input
                    type="text"
                    value={formData.venue_address}
                    onChange={(e) => setFormData({ ...formData, venue_address: e.target.value })}
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Starts At *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.starts_at}
                    onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ends At *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.ends_at}
                    onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price (£) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacity *</label>
                  <input
                    type="number"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cover Image</label>
                
                {/* Image Preview */}
                {(imagePreview || formData.cover_image) && (
                  <div className="mb-3">
                    <img
                      src={imagePreview || formData.cover_image}
                      alt="Preview"
                      className="max-w-xs max-h-48 object-cover rounded border"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {/* File Upload Option */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-600 mb-1">Upload from Computer:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleImageUpload(file);
                      }
                    }}
                    disabled={uploadingImage}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
                  />
                  {uploadingImage && (
                    <p className="text-xs text-gray-500 mt-1">Uploading...</p>
                  )}
                </div>
                
                {/* URL Option */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Or Paste Image URL:</label>
                  <input
                    type="url"
                    value={formData.cover_image}
                    onChange={(e) => {
                      setFormData({ ...formData, cover_image: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Video URL</label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="mr-2"
                  />
                  Featured Event
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1 border rounded-md px-3 py-2"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingEvent ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;

