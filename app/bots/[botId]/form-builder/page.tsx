'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

interface FormField {
  id?: string;
  field_name: string;
  field_label: string;
  field_type: string;
  field_order: number;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  options?: Array<{ value: string; label: string; capacity?: number }>;
  default_value?: string;
  is_active?: boolean;
}

interface Resource {
  id?: string;
  resource_type: string;
  resource_name: string;
  resource_code?: string;
  description?: string;
  capacity_per_slot: number;
  metadata?: any;
  is_active?: boolean;
}

interface ResourceSchedule {
  id?: string;
  resource_id: string;
  day_of_week?: number;
  specific_date?: string;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_available: boolean;
}

export default function FormBuilderPage() {
  const params = useParams();
  const botId = params.botId as string;
  
  const [activeTab, setActiveTab] = useState<'fields' | 'resources' | 'templates'>('fields');
  const [formConfig, setFormConfig] = useState<any>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form field state
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [showFieldForm, setShowFieldForm] = useState(false);
  
  // Resource state
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [resourceSchedules, setResourceSchedules] = useState<ResourceSchedule[]>([]);
  
  // Form config editing state
  const [editingFormConfig, setEditingFormConfig] = useState(false);
  const [formConfigData, setFormConfigData] = useState({
    name: '',
    description: '',
    industry: ''
  });
  
  const FIELD_TYPES = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'number', label: 'Number' },
    { value: 'select', label: 'Dropdown (Select)' },
    { value: 'multiselect', label: 'Multiple Select' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Time' },
    { value: 'datetime', label: 'Date & Time' },
    { value: 'textarea', label: 'Text Area' }
  ];
  
  const RESOURCE_TYPES = [
    { value: 'doctor', label: 'Doctor/Physician' },
    { value: 'staff', label: 'Staff Member' },
    { value: 'room', label: 'Room/Facility' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'service', label: 'Service' }
  ];
  
  const DAYS_OF_WEEK = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  useEffect(() => {
    loadData();
  }, [botId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load or create form configuration
      let configRes = await fetch(`${API_BASE}/form-configs/${botId}`);
      let config;
      
      if (configRes.ok) {
        config = await configRes.json();
      } else if (configRes.status === 404) {
        // Create default form config if it doesn't exist
        const createRes = await fetch(`${API_BASE}/form-configs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            org_id: 'default-org',
            bot_id: botId,
            name: 'Booking Form',
            description: 'Default booking form',
            industry: 'other'
          })
        });
        
        if (createRes.ok) {
          config = await createRes.json();
        } else {
          console.error('Failed to create form config');
          setLoading(false);
          return;
        }
      }
      
      if (config) {
        setFormConfig(config);
        setFormConfigData({
          name: config.name || '',
          description: config.description || '',
          industry: config.industry || ''
        });
        
        // Load fields
        const fieldsRes = await fetch(`${API_BASE}/form-configs/${config.id}/fields`);
        if (fieldsRes.ok) {
          const fieldsData = await fieldsRes.json();
          setFields(fieldsData.fields || []);
        }
      }
      
      // Load resources
      const resourcesRes = await fetch(`${API_BASE}/resources/${botId}`);
      if (resourcesRes.ok) {
        const resourcesData = await resourcesRes.json();
        setResources(resourcesData.resources || []);
      }
      
      // Load templates
      const templatesRes = await fetch(`${API_BASE}/form-templates`);
      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setTemplates(templatesData.templates || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveField = async (field: FormField) => {
    try {
      let response;
      if (field.id) {
        // Update existing field
        response = await fetch(`${API_BASE}/form-fields/${field.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(field)
        });
      } else {
        // Create new field
        response = await fetch(`${API_BASE}/form-configs/${formConfig.id}/fields`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(field)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }
      
      setShowFieldForm(false);
      setEditingField(null);
      loadData();
    } catch (error) {
      console.error('Error saving field:', error);
      alert(`Failed to save field: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const deleteField = async (fieldId: string) => {
    if (!confirm('Are you sure you want to delete this field?')) return;
    
    try {
      await fetch(`${API_BASE}/form-fields/${fieldId}`, { method: 'DELETE' });
      loadData();
    } catch (error) {
      console.error('Error deleting field:', error);
      alert('Failed to delete field');
    }
  };

  const saveResource = async (resource: Resource) => {
    try {
      const orgId = formConfig?.org_id;
      
      if (resource.id) {
        // Update existing resource
        await fetch(`${API_BASE}/resources/${resource.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resource)
        });
      } else {
        // Create new resource
        await fetch(`${API_BASE}/resources`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...resource, org_id: orgId, bot_id: botId })
        });
      }
      
      setShowResourceForm(false);
      setEditingResource(null);
      loadData();
    } catch (error) {
      console.error('Error saving resource:', error);
      alert('Failed to save resource');
    }
  };

  const saveFormConfig = async () => {
    if (!formConfigData.name.trim()) {
      alert('Form name is required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/form-configs/${formConfig.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formConfigData)
      });

      if (response.ok) {
        alert('Form configuration updated successfully!');
        setEditingFormConfig(false);
        loadData();
      } else {
        alert('Failed to update form configuration');
      }
    } catch (error) {
      console.error('Error saving form config:', error);
      alert('Failed to save form configuration');
    }
  };

  const applyTemplate = async (templateId: string) => {
    if (!formConfig) {
      alert('Please wait for form configuration to load');
      return;
    }
    
    if (!confirm('This will add fields from the template to your form. Continue?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/form-configs/${formConfig.id}/apply-template/${templateId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        alert('Template applied successfully!');
        loadData();
      } else {
        alert('Failed to apply template');
      }
    } catch (error) {
      console.error('Error applying template:', error);
      alert('Failed to apply template');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎨 Dynamic Form Builder</h1>
          <p className="text-gray-600">Create and customize booking forms for your industry - healthcare, salon, consulting, and more!</p>
        </div>
      
        {/* Form Configuration Card */}
        {formConfig && (
          <div className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
            {!editingFormConfig ? (
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{formConfig.name}</h2>
                    {formConfig.industry && (
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                        {formConfig.industry.charAt(0).toUpperCase() + formConfig.industry.slice(1)}
                      </span>
                    )}
                  </div>
                  {formConfig.description && (
                    <p className="text-blue-100 mb-3">{formConfig.description}</p>
                  )}
                  <div className="flex gap-4 text-sm text-blue-100">
                    <span>📋 {fields.length} custom fields</span>
                    <span>👥 {resources.length} resources</span>
                  </div>
                </div>
                <button
                  onClick={() => setEditingFormConfig(true)}
                  className="px-5 py-2.5 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  ✏️ Edit Info
                </button>
              </div>
            ) : (
              <div className="space-y-4 bg-white/10 backdrop-blur-md rounded-xl p-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">Form Name *</label>
                  <input
                    type="text"
                    value={formConfigData.name}
                    onChange={(e) => setFormConfigData({ ...formConfigData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-white/30 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:border-white focus:bg-white/30"
                    placeholder="e.g., Healthcare Appointment Form"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">Description</label>
                  <textarea
                    value={formConfigData.description}
                    onChange={(e) => setFormConfigData({ ...formConfigData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-white/30 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:border-white focus:bg-white/30"
                    rows={2}
                    placeholder="Brief description of this form"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">Industry</label>
                  <select
                    value={formConfigData.industry}
                    onChange={(e) => setFormConfigData({ ...formConfigData, industry: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-white/30 rounded-xl bg-white/20 backdrop-blur-sm text-white focus:outline-none focus:border-white focus:bg-white/30"
                  >
                    <option value="" className="text-gray-900">Select industry...</option>
                    <option value="healthcare" className="text-gray-900">🏥 Healthcare</option>
                    <option value="salon" className="text-gray-900">💇 Salon & Spa</option>
                    <option value="consulting" className="text-gray-900">💼 Consulting</option>
                    <option value="education" className="text-gray-900">📚 Education</option>
                    <option value="legal" className="text-gray-900">⚖️ Legal</option>
                    <option value="fitness" className="text-gray-900">💪 Fitness</option>
                    <option value="other" className="text-gray-900">📦 Other</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={saveFormConfig}
                    className="flex-1 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg"
                  >
                    💾 Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditingFormConfig(false);
                      setFormConfigData({
                        name: formConfig.name || '',
                        description: formConfig.description || '',
                        industry: formConfig.industry || ''
                      });
                    }}
                    className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/30 transition-all"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      {/* Tabs */}
      <div className="mb-6 bg-white rounded-2xl shadow-lg p-2 flex gap-2">
        <button
          onClick={() => setActiveTab('fields')}
          className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${
            activeTab === 'fields'
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <div className="text-2xl mb-1">📝</div>
          <div>Form Fields</div>
          <div className="text-xs opacity-80">{fields.length} fields</div>
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${
            activeTab === 'resources'
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <div className="text-2xl mb-1">👥</div>
          <div>Resources</div>
          <div className="text-xs opacity-80">{resources.length} resources</div>
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${
            activeTab === 'templates'
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <div className="text-2xl mb-1">🎯</div>
          <div>Templates</div>
          <div className="text-xs opacity-80">Quick start</div>
        </button>
      </div>

      {/* Form Fields Tab */}
      {activeTab === 'fields' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Custom Form Fields</h2>
              <p className="text-gray-600 mt-1">Add fields to collect information from your customers</p>
            </div>
            <button
              onClick={() => {
                setEditingField({
                  field_name: '',
                  field_label: '',
                  field_type: 'text',
                  field_order: fields.length,
                  is_required: false
                });
                setShowFieldForm(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              ➕ Add Field
            </button>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No fields yet</h3>
              <p className="text-gray-500 mb-6">Add your first custom field or apply a template to get started</p>
              <button
                onClick={() => setActiveTab('templates')}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
              >
                🎯 Browse Templates
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="group p-5 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all bg-gradient-to-r from-white to-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                        <span className="text-lg font-bold text-gray-900">{field.field_label}</span>
                        {field.is_required && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">REQUIRED</span>
                        )}
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                          {field.field_type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Field name: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{field.field_name}</code></p>
                      {field.help_text && (
                        <p className="text-xs text-gray-500 mt-2 flex items-start gap-2">
                          <span>💡</span>
                          <span>{field.help_text}</span>
                        </p>
                      )}
                      {field.options && field.options.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {field.options.map((opt, i) => (
                            <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md border border-purple-200">
                              {opt.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingField(field);
                          setShowFieldForm(true);
                        }}
                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition-all"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteField(field.id!)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-all"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Field Form Modal */}
          {showFieldForm && editingField && (
            <FieldFormModal
              field={editingField}
              fieldTypes={FIELD_TYPES}
              onSave={saveField}
              onCancel={() => {
                setShowFieldForm(false);
                setEditingField(null);
              }}
            />
          )}
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Resources & Capacity</h2>
              <p className="text-gray-600 mt-1">Manage doctors, staff, rooms, and equipment with scheduling</p>
            </div>
            <button
              onClick={() => {
                setEditingResource({
                  resource_type: 'doctor',
                  resource_name: '',
                  capacity_per_slot: 1
                });
                setShowResourceForm(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              ➕ Add Resource
            </button>
          </div>

          {resources.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No resources yet</h3>
              <p className="text-gray-500 mb-6">Add doctors, staff members, rooms, or equipment that can be booked</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((resource) => (
                <div key={resource.id} className="group p-6 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:shadow-xl transition-all bg-gradient-to-br from-white to-purple-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">
                          {resource.resource_type === 'doctor' && '👨‍⚕️'}
                          {resource.resource_type === 'staff' && '👤'}
                          {resource.resource_type === 'room' && '🏠'}
                          {resource.resource_type === 'equipment' && '🔧'}
                          {resource.resource_type === 'service' && '⚙️'}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900">{resource.resource_name}</h3>
                      </div>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                        {resource.resource_type}
                      </span>
                    </div>
                  </div>
                  {resource.description && (
                    <p className="text-sm text-gray-600 mb-3 bg-white/50 p-2 rounded-lg">{resource.description}</p>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Capacity:</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-full">
                        {resource.capacity_per_slot} per slot
                      </span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingResource(resource);
                          setShowResourceForm(true);
                        }}
                        className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-semibold"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => setSelectedResource(resource.id!)}
                        className="px-3 py-1.5 text-purple-600 hover:bg-purple-50 rounded-lg text-sm font-semibold"
                      >
                        📅 Schedule
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Resource Form Modal */}
          {showResourceForm && editingResource && (
            <ResourceFormModal
              resource={editingResource}
              resourceTypes={RESOURCE_TYPES}
              onSave={saveResource}
              onCancel={() => {
                setShowResourceForm(false);
                setEditingResource(null);
              }}
            />
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">🎯 Industry Templates</h2>
            <p className="text-gray-600 mt-1">
              Quick-start with pre-built templates designed for specific industries. Customize after applying!
            </p>
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No templates available</h3>
              <p className="text-gray-500">Check back later for industry-specific templates</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="group relative overflow-hidden border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="p-6 relative">
                    <div className="text-4xl mb-3">
                      {template.industry === 'healthcare' && '🏥'}
                      {template.industry === 'salon' && '💇'}
                      {template.industry === 'consulting' && '💼'}
                      {template.industry === 'education' && '📚'}
                      {template.industry === 'legal' && '⚖️'}
                      {template.industry === 'fitness' && '💪'}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-3">
                      {template.industry}
                    </span>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{template.description}</p>
                    <button
                      onClick={() => applyTemplate(template.id)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all transform group-hover:scale-105"
                    >
                      ✨ Apply Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <h3 className="font-bold text-gray-900 mb-2">💡 Pro Tip</h3>
            <p className="text-sm text-gray-700">
              After applying a template, you can customize the fields, add more resources, and adjust settings to match your exact needs. 
              Templates are just a starting point to save you time!
            </p>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

// Field Form Modal Component
function FieldFormModal({
  field,
  fieldTypes,
  onSave,
  onCancel
}: {
  field: FormField;
  fieldTypes: Array<{ value: string; label: string }>;
  onSave: (field: FormField) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState(field);
  const [options, setOptions] = useState<Array<{ value: string; label: string; capacity?: number }>>(
    field.options || []
  );

  // Update state when field prop changes (when editing different fields)
  useEffect(() => {
    setFormData(field);
    setOptions(field.options || []);
  }, [field]);

  const addOption = () => {
    setOptions([...options, { value: '', label: '', capacity: undefined }]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, key: 'value' | 'label' | 'capacity', value: any) => {
    const newOptions = [...options];
    if (key === 'capacity') {
      newOptions[index][key] = value ? parseInt(value) : undefined;
    } else {
      newOptions[index][key] = value;
    }
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create updated field data
    const updatedField = { ...formData };
    
    // Add options to formData if it's a select/multiselect/radio field
    if (['select', 'multiselect', 'radio'].includes(formData.field_type)) {
      updatedField.options = options.filter(opt => opt.value && opt.label);
    } else {
      // Remove options for non-select fields
      delete updatedField.options;
    }
    
    onSave(updatedField);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl">
          <h3 className="text-2xl font-bold">{field.id ? '✏️ Edit Field' : '➕ Add New Field'}</h3>
          <p className="text-blue-100 text-sm mt-1">Configure your custom form field</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Field Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.field_name}
                onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="e.g., doctor_name"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Internal identifier (no spaces)</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Field Label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.field_label}
                onChange={(e) => setFormData({ ...formData, field_label: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="e.g., Select Doctor"
                required
              />
              <p className="text-xs text-gray-500 mt-1">What users will see</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Field Type</label>
              <select
                value={formData.field_type}
                onChange={(e) => setFormData({ ...formData, field_type: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                {fieldTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Field Order</label>
              <input
                type="number"
                value={formData.field_order}
                onChange={(e) => setFormData({ ...formData, field_order: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">Display order (1, 2, 3...)</p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_required}
                onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="text-sm font-semibold text-gray-700">Make this field required</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Placeholder Text</label>
            <input
              type="text"
              value={formData.placeholder || ''}
              onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="e.g., Choose your doctor..."
            />
            <p className="text-xs text-gray-500 mt-1">Hint text shown inside the field</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Help Text</label>
            <input
              type="text"
              value={formData.help_text || ''}
              onChange={(e) => setFormData({ ...formData, help_text: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="e.g., Select your preferred doctor from the list"
            />
            <p className="text-xs text-gray-500 mt-1">Additional guidance shown below the field</p>
          </div>

          {['select', 'multiselect', 'radio'].includes(formData.field_type) && (
            <div className="border-2 border-purple-200 bg-purple-50 p-6 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800">
                    🎯 Dropdown Options
                  </label>
                  <p className="text-xs text-gray-600 mt-1">Add choices for users to select from</p>
                </div>
                <button
                  type="button"
                  onClick={addOption}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all shadow-md"
                >
                  ➕ Add Option
                </button>
              </div>
              
              {options.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500 text-sm mb-3">No options yet</p>
                  <button
                    type="button"
                    onClick={addOption}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600"
                  >
                    Add First Option
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {options.map((option, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-all">
                      <div className="flex items-start gap-3">
                        <span className="text-sm font-bold text-gray-400 mt-2">#{index + 1}</span>
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              Value <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={option.value}
                              onChange={(e) => updateOption(index, 'value', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                              placeholder="dr_smith"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              Label <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={option.label}
                              onChange={(e) => updateOption(index, 'label', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                              placeholder="Dr. John Smith"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              Capacity <span className="text-gray-400">(optional)</span>
                            </label>
                            <input
                              type="number"
                              value={option.capacity || ''}
                              onChange={(e) => updateOption(index, 'capacity', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                              placeholder="5"
                              min="1"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="mt-6 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Remove option"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-900">
                  <strong>💡 Tips:</strong> <br/>
                  • <strong>Value</strong>: Internal identifier (e.g., "dr_smith")<br/>
                  • <strong>Label</strong>: What users see (e.g., "Dr. John Smith")<br/>
                  • <strong>Capacity</strong>: Maximum bookings per slot (optional, for resources)
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              ❌ Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              💾 Save Field
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Resource Form Modal Component
function ResourceFormModal({
  resource,
  resourceTypes,
  onSave,
  onCancel
}: {
  resource: Resource;
  resourceTypes: Array<{ value: string; label: string }>;
  onSave: (resource: Resource) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState(resource);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <h3 className="text-xl font-bold mb-4">{resource.id ? 'Edit' : 'Add'} Resource</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Resource Type</label>
            <select
              value={formData.resource_type}
              onChange={(e) => setFormData({ ...formData, resource_type: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              {resourceTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Resource Name</label>
            <input
              type="text"
              value={formData.resource_name}
              onChange={(e) => setFormData({ ...formData, resource_name: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="e.g., Dr. John Smith"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Resource Code (optional)</label>
            <input
              type="text"
              value={formData.resource_code || ''}
              onChange={(e) => setFormData({ ...formData, resource_code: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="e.g., DOC001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Capacity per Time Slot</label>
            <input
              type="number"
              min="1"
              value={formData.capacity_per_slot}
              onChange={(e) => setFormData({ ...formData, capacity_per_slot: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded"
            />
            <p className="text-xs text-gray-500 mt-1">
              How many appointments can this resource handle simultaneously?
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Resource
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
