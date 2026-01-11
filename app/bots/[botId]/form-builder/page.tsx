'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';

function B() {
  const env = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin.replace(/\/$/, "");
  return "";
}

const API_BASE = () => `${B()}/api`;

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
  // Validation fields
  country_code?: string;
  phone_digits?: number;
  min_value?: number;
  max_value?: number;
  pattern?: string;
}

interface Resource {
  id?: string;
  resource_type: string;
  resource_name: string;
  resource_code?: string;
  department?: string;
  description?: string;
  capacity_per_slot: number;
  metadata?: Record<string, unknown>;
  is_active?: boolean;
}

interface FormConfig {
  id: string;
  org_id: string;
  bot_id: string;
  name: string;
  description?: string;
  industry?: string;
}

interface Template {
  id: string;
  name: string;
  description?: string;
  industry?: string;
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
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form field state
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [showFieldForm, setShowFieldForm] = useState(false);
  
  // Resource state
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [resourceSchedules, setResourceSchedules] = useState<ResourceSchedule[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
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
    { value: 'radio', label: 'Radio Buttons' },
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

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load or create form configuration
      const configRes = await fetch(`${API_BASE()}/form-configs/${botId}`);
      let config;
      
      if (configRes.ok) {
        config = await configRes.json();
      } else if (configRes.status === 404) {
        // Create default form config if it doesn't exist
        const createRes = await fetch(`${API_BASE()}/form-configs`, {
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
        const fieldsRes = await fetch(`${API_BASE()}/form-configs/${config.id}/fields`);
        if (fieldsRes.ok) {
          const fieldsData = await fieldsRes.json();
          const allFields = fieldsData.fields || [];
          setFields(allFields);
        }
      }
      
      // Load resources
      const resourcesRes = await fetch(`${API_BASE()}/resources/${botId}`);
      if (resourcesRes.ok) {
        const resourcesData = await resourcesRes.json();
        setResources(resourcesData.resources || []);
      }
      
      // Load templates
      const templatesRes = await fetch(`${API_BASE()}/form-templates`);
      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setTemplates(templatesData.templates || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [botId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const f = async () => {
      if (!selectedResource) return;
      try {
        const r = await fetch(`${API_BASE()}/resources/${selectedResource}/schedules`);
        if (r.ok) {
          const d = await r.json();
          setResourceSchedules(d.schedules || []);
          setShowScheduleModal(true);
        }
      } catch {
      }
    };
    f();
  }, [selectedResource]);

  const addSchedule = async (payload: Omit<ResourceSchedule, 'id' | 'resource_id'>) => {
    if (!selectedResource) return;
    const body = {
      resource_id: selectedResource,
      day_of_week: payload.day_of_week,
      specific_date: payload.specific_date,
      start_time: payload.start_time,
      end_time: payload.end_time,
      slot_duration_minutes: payload.slot_duration_minutes,
      is_available: payload.is_available
    };
    const r = await fetch(`${API_BASE()}/resources/${selectedResource}/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (r.ok) {
      const rr = await fetch(`${API_BASE()}/resources/${selectedResource}/schedules`);
      if (rr.ok) {
        const d = await rr.json();
        setResourceSchedules(d.schedules || []);
      }
    }
  };

  const removeSchedule = async (scheduleId: string) => {
    const r = await fetch(`${API_BASE()}/schedules/${scheduleId}`, { method: 'DELETE' });
    if (r.ok && selectedResource) {
      const rr = await fetch(`${API_BASE()}/resources/${selectedResource}/schedules`);
      if (rr.ok) {
        const d = await rr.json();
        setResourceSchedules(d.schedules || []);
      }
    }
  };

  const saveField = async (field: FormField) => {
    if (!formConfig) {
      alert('Form configuration not loaded');
      return;
    }
    
    try {
      let response;
      if (field.id) {
        // Update existing field
        response = await fetch(`${API_BASE()}/form-fields/${field.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(field)
        });
      } else {
        // Create new field
        response = await fetch(`${API_BASE()}/form-configs/${formConfig.id}/fields`, {
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
      await fetch(`${API_BASE()}/form-fields/${fieldId}`, { method: 'DELETE' });
      loadData();
    } catch (error) {
      console.error('Error deleting field:', error);
      alert('Failed to delete field');
    }
  };

  const deleteResource = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      await fetch(`${API_BASE()}/resources/${resourceId}`, { method: 'DELETE' });
      loadData();
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Failed to delete resource');
    }
  };

  const saveResource = async (resource: Resource) => {
    try {
      const orgId = formConfig?.org_id;
      
      if (resource.id) {
        // Update existing resource
        await fetch(`${API_BASE()}/resources/${resource.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resource)
        });
      } else {
        // Create new resource
        await fetch(`${API_BASE()}/resources`, {
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

    if (!formConfig) {
      alert('Form configuration not loaded');
      return;
    }

    try {
      const response = await fetch(`${API_BASE()}/form-configs/${formConfig.id}`, {
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
      const response = await fetch(`${API_BASE()}/form-configs/${formConfig.id}/apply-template/${templateId}`, {
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/bots/${botId}/config`} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dynamic Form Builder</h1>
            <p className="text-sm text-gray-500">Create and customize booking forms for your industry</p>
          </div>
        </div>

        {/* Form Configuration Card */}
        {formConfig && (
          <Card className="border-blue-100 bg-gradient-to-r from-blue-50 to-white">
            <CardContent className="p-6">
              {!editingFormConfig ? (
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-gray-900">{formConfig.name}</h2>
                      {formConfig.industry && (
                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium uppercase">
                          {formConfig.industry}
                        </span>
                      )}
                    </div>
                    {formConfig.description && (
                      <p className="text-gray-600">{formConfig.description}</p>
                    )}
                    <div className="flex gap-4 text-sm text-gray-500 pt-2">
                      <span>📋 {fields.length} custom fields</span>
                      <span>👥 {resources.length} resources</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setEditingFormConfig(true)}
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    Edit Info
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Form Name"
                      value={formConfigData.name}
                      onChange={(e) => setFormConfigData({ ...formConfigData, name: e.target.value })}
                      placeholder="e.g., Healthcare Appointment Form"
                    />
                    <Select
                      label="Industry"
                      value={formConfigData.industry}
                      onChange={(e) => setFormConfigData({ ...formConfigData, industry: e.target.value })}
                      options={[
                        { value: "", label: "Select industry..." },
                        { value: "healthcare", label: "🏥 Healthcare" },
                        { value: "salon", label: "💇 Salon & Spa" },
                        { value: "consulting", label: "💼 Consulting" },
                        { value: "education", label: "📚 Education" },
                        { value: "legal", label: "⚖️ Legal" },
                        { value: "fitness", label: "💪 Fitness" },
                        { value: "other", label: "📦 Other" }
                      ]}
                    />
                  </div>
                  <Textarea
                    label="Description"
                    value={formConfigData.description}
                    onChange={(e) => setFormConfigData({ ...formConfigData, description: e.target.value })}
                    placeholder="Brief description of this form"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button onClick={saveFormConfig}>Save Changes</Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditingFormConfig(false);
                        setFormConfigData({
                          name: formConfig.name || '',
                          description: formConfig.description || '',
                          industry: formConfig.industry || ''
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('fields')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'fields'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Form Fields ({fields.length})
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'resources'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Resources ({resources.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'templates'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Templates
          </button>
        </div>

        {/* Form Fields Tab */}
        {activeTab === 'fields' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Form Fields</h2>
                <p className="text-sm text-gray-500">Customize what information to collect</p>
              </div>
              <Button
                onClick={() => {
                  setEditingField({
                    field_name: '',
                    field_label: '',
                    field_type: 'text',
                    field_order: fields.length,
                    is_required: false
                  } as FormField);
                  setShowFieldForm(true);
                }}
              >
                Add Field
              </Button>
            </div>

            {fields.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900">No form fields yet</h3>
                  <p className="text-sm text-gray-500 mb-6">Add your first custom field or apply a template</p>
                  <Button variant="outline" onClick={() => setActiveTab('templates')}>
                    Browse Templates
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="group hover:border-blue-200 transition-all">
                    <CardContent className="p-4 flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-gray-400">#{index + 1}</span>
                          <span className="font-medium text-gray-900">{field.field_label}</span>
                          {field.is_required && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">Required</span>
                          )}
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {field.field_type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-mono">ID: {field.field_name}</p>
                        {field.help_text && (
                          <p className="text-xs text-gray-500 italic">{field.help_text}</p>
                        )}
                        {field.options && field.options.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {field.options.map((opt, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-gray-50 text-gray-600 text-[10px] rounded border border-gray-200">
                                {opt.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingField(field);
                            setShowFieldForm(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => deleteField(field.id!)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Resources & Capacity</h2>
                <p className="text-sm text-gray-500">Manage doctors, staff, rooms, etc.</p>
              </div>
              <Button
                onClick={() => {
                  setEditingResource({
                    resource_type: 'doctor',
                    resource_name: '',
                    capacity_per_slot: 1
                  });
                  setShowResourceForm(true);
                }}
              >
                Add Resource
              </Button>
            </div>

            {resources.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="text-lg font-medium text-gray-900">No resources yet</h3>
                  <p className="text-sm text-gray-500">Add resources that can be booked</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.map((resource) => (
                  <Card key={resource.id} className="group hover:border-blue-200 transition-all">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">
                              {resource.resource_type === 'doctor' && '👨‍⚕️'}
                              {resource.resource_type === 'staff' && '👤'}
                              {resource.resource_type === 'room' && '🏠'}
                              {resource.resource_type === 'equipment' && '🔧'}
                              {resource.resource_type === 'service' && '⚙️'}
                            </span>
                            <h3 className="font-bold text-gray-900">{resource.resource_name}</h3>
                          </div>
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {resource.resource_type}
                          </span>
                        </div>
                      </div>
                      {resource.description && (
                        <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          Capacity: <span className="font-medium text-gray-900">{resource.capacity_per_slot}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingResource(resource);
                              setShowResourceForm(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => {
                              setSelectedResource(resource.id!);
                              setShowScheduleModal(true);
                            }}
                          >
                            Schedule
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => deleteResource(resource.id!)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Industry Templates</h2>
              <p className="text-sm text-gray-500">Quick-start with pre-built templates</p>
            </div>

            {templates.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-4xl mb-4">📦</div>
                  <h3 className="text-lg font-medium text-gray-900">No templates available</h3>
                  <p className="text-sm text-gray-500">Check back later for industry-specific templates</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-all cursor-pointer border-t-4 border-t-blue-500">
                    <CardContent className="p-6">
                      <div className="text-3xl mb-3">
                        {template.industry === 'healthcare' && '🏥'}
                        {template.industry === 'salon' && '💇'}
                        {template.industry === 'consulting' && '💼'}
                        {template.industry === 'education' && '📚'}
                        {template.industry === 'legal' && '⚖️'}
                        {template.industry === 'fitness' && '💪'}
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">{template.name}</h3>
                      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full mb-3 uppercase">
                        {template.industry}
                      </span>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{template.description}</p>
                      <Button onClick={() => applyTemplate(template.id)} className="w-full">
                        Apply Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Field Form Modal */}
      {showFieldForm && editingField && (
        <FieldFormModal
          field={editingField}
          fieldTypes={FIELD_TYPES}
          onSave={saveField}
          resources={resources}
          onCancel={() => {
            setShowFieldForm(false);
            setEditingField(null);
          }}
        />
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

      {/* Schedule Modal */}
      {showScheduleModal && selectedResource && (
        <ScheduleModal
          schedules={resourceSchedules}
          days={DAYS_OF_WEEK}
          onAdd={addSchedule}
          onDelete={removeSchedule}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedResource(null);
            setResourceSchedules([]);
          }}
        />
      )}
    </div>
  );
}

function ScheduleModal({
  schedules,
  days,
  onAdd,
  onDelete,
  onClose
}: {
  schedules: ResourceSchedule[];
  days: Array<{ value: number; label: string }>;
  onAdd: (payload: Omit<ResourceSchedule, 'id' | 'resource_id'>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const [dayOfWeek, setDayOfWeek] = useState<number | undefined>(1);
  const [specificDate, setSpecificDate] = useState<string | undefined>(undefined);
  const [startTime, setStartTime] = useState<string>('07:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [slotMinutes, setSlotMinutes] = useState<number>(30);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      day_of_week: specificDate ? undefined : dayOfWeek,
      specific_date: specificDate,
      start_time: startTime,
      end_time: endTime,
      slot_duration_minutes: slotMinutes,
      is_available: isAvailable
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <CardTitle className="text-xl">📅 Resource Schedules</CardTitle>
            <p className="text-xs text-gray-500 mt-1">Configure weekly and specific date availability slots</p>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</Button>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Add Slots Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Slot Card */}
            <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">📆</span>
                <h4 className="font-semibold text-gray-900">Weekly Recurring Slot</h4>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">Add a slot that repeats every week on a specific day and time.</p>
              <form onSubmit={submit} className="space-y-3.5">
                <Select
                  label="Day of Week"
                  value={String(dayOfWeek)}
                  onChange={e => setDayOfWeek(parseInt(e.target.value))}
                  options={days.map(d => ({ value: String(d.value), label: d.label }))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input type="time" label="Start Time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  </div>
                  <div>
                    <Input type="time" label="End Time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input type="number" label="Duration (minutes)" min={5} step={5} value={slotMinutes} onChange={e => setSlotMinutes(parseInt(e.target.value))} />
                  </div>
                  <div className="flex items-end h-full pb-1">
                    <label className="flex items-center gap-2.5 text-sm cursor-pointer hover:opacity-80">
                      <input type="checkbox" checked={isAvailable} onChange={e => setIsAvailable(e.target.checked)} className="rounded border-gray-300 cursor-pointer" />
                      <span className="font-medium text-gray-700">Available</span>
                    </label>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition">
                  ➕ Add Weekly Slot
                </Button>
              </form>
            </div>

            {/* Specific Date Card */}
            <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-xl space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">📍</span>
                <h4 className="font-semibold text-gray-900">One-Time Slot</h4>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">Add a single slot for a specific date (e.g., special hours on a holiday).</p>
              <div className="space-y-3.5">
                <Input type="date" label="Date" value={specificDate || ''} onChange={e => setSpecificDate(e.target.value || undefined)} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input type="time" label="Start Time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  </div>
                  <div>
                    <Input type="time" label="End Time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input type="number" label="Duration (minutes)" min={5} step={5} value={slotMinutes} onChange={e => setSlotMinutes(parseInt(e.target.value))} />
                  </div>
                  <div className="flex items-end h-full pb-1">
                    <label className="flex items-center gap-2.5 text-sm cursor-pointer hover:opacity-80">
                      <input type="checkbox" checked={isAvailable} onChange={e => setIsAvailable(e.target.checked)} className="rounded border-gray-300 cursor-pointer" />
                      <span className="font-medium text-gray-700">Available</span>
                    </label>
                  </div>
                </div>
                <Button onClick={submit} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition">
                  ➕ Add Date Slot
                </Button>
              </div>
            </div>
          </div>

          {/* Existing Schedules Section */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📋</span>
              <h4 className="font-semibold text-gray-900">Your Schedules ({schedules.length})</h4>
            </div>
            {schedules.length === 0 ? (
              <div className="p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                <p className="text-sm text-gray-500">No schedules configured yet. Add your first weekly or date slot above.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
                {schedules.map((s, idx) => (
                  <div key={s.id} className="flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-400"></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 text-sm">
                            {s.specific_date ? s.specific_date : days.find(d => d.value === s.day_of_week)?.label}
                          </span>
                          <span className="text-gray-600 text-sm font-medium">
                            {s.start_time} – {s.end_time}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                            {s.slot_duration_minutes}m slots
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            s.is_available 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : 'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            {s.is_available ? '✓ Available' : '✗ Unavailable'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => onDelete(s.id!)} 
                      className="ml-3 px-3 py-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md text-xs font-semibold transition border border-transparent hover:border-red-200"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FieldFormModal({
  field,
  fieldTypes,
  onSave,
  onCancel,
  resources
}: {
  field: FormField;
  fieldTypes: Array<{ value: string; label: string }>;
  onSave: (field: FormField) => void;
  onCancel: () => void;
  resources: Resource[];
}) {
  const [formData, setFormData] = useState(field);
  const [options, setOptions] = useState<Array<{ value: string; label: string; capacity?: number }>>(
    field.options || []
  );

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

  const updateOption = (index: number, key: 'value' | 'label' | 'capacity', value: unknown) => {
    const newOptions = [...options];
    if (key === 'capacity') {
      newOptions[index][key] = value ? parseInt(String(value)) : undefined;
    } else {
      newOptions[index][key] = String(value);
    }
    setOptions(newOptions);
  };
  
  const importResourcesAsOptions = () => {
    try {
      const mapped = (resources || []).map(r => {
        let cleanValue = r.resource_code;
        if (!cleanValue) {
          cleanValue = (r.resource_name || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
        }
        
        return {
          value: cleanValue || String(r.id),
          label: r.department ? `${r.resource_name} (${r.department})` : r.resource_name,
          capacity: r.capacity_per_slot || undefined
        };
      });
      setOptions(mapped);
    } catch {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedField = { ...formData };
    if (['select', 'radio'].includes(formData.field_type)) {
      updatedField.options = options.filter(opt => opt.value && opt.label);
    } else {
      delete updatedField.options;
    }
    onSave(updatedField);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{field.id ? 'Edit Field' : 'Add New Field'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Field Name *"
                value={formData.field_name}
                onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                placeholder="e.g., doctor_name"
                description="Internal identifier (no spaces)"
                required
              />
              <Input
                label="Field Label *"
                value={formData.field_label}
                onChange={(e) => setFormData({ ...formData, field_label: e.target.value })}
                placeholder="e.g., Select Doctor"
                description="What users will see"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Field Type"
                value={formData.field_type}
                onChange={(e) => setFormData({ ...formData, field_type: e.target.value })}
                options={fieldTypes}
              />
              <Input
                label="Field Order"
                type="number"
                value={formData.field_order}
                onChange={(e) => setFormData({ ...formData, field_order: parseInt(e.target.value) })}
                description="Display order (1, 2, 3...)"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_required"
                checked={formData.is_required}
                onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_required" className="text-sm font-medium text-gray-700">Make this field required</label>
            </div>

            <Input
              label="Placeholder Text"
              value={formData.placeholder || ''}
              onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
              placeholder="e.g., Choose your doctor..."
            />

            <Input
              label="Help Text"
              value={formData.help_text || ''}
              onChange={(e) => setFormData({ ...formData, help_text: e.target.value })}
              placeholder="e.g., Select your preferred doctor from the list"
            />

            {formData.field_type === 'email' && (
              <div className="p-4 bg-blue-50 rounded-lg space-y-3">
                <h4 className="font-medium text-blue-900">Email Validation</h4>
                <Input
                  label="Allowed Domains (optional)"
                  value={formData.pattern || ''}
                  onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                  placeholder="e.g., company.com, gmail.com"
                  description="Leave empty to allow all emails"
                />
              </div>
            )}

            {formData.field_type === 'phone' && (
              <div className="p-4 bg-green-50 rounded-lg space-y-3">
                <h4 className="font-medium text-green-900">Phone Validation</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Country Code"
                    value={formData.country_code || ''}
                    onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                    placeholder="e.g., +1"
                  />
                  <Input
                    label="Digits"
                    type="number"
                    value={formData.phone_digits || ''}
                    onChange={(e) => setFormData({ ...formData, phone_digits: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="e.g., 10"
                  />
                </div>
              </div>
            )}

            {formData.field_type === 'number' && (
              <div className="p-4 bg-orange-50 rounded-lg space-y-3">
                <h4 className="font-medium text-orange-900">Number Constraints</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Min Value"
                    type="number"
                    value={formData.min_value || ''}
                    onChange={(e) => setFormData({ ...formData, min_value: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                  <Input
                    label="Max Value"
                    type="number"
                    value={formData.max_value || ''}
                    onChange={(e) => setFormData({ ...formData, max_value: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
              </div>
            )}

            {['select', 'radio'].includes(formData.field_type) && (
              <div className="space-y-4 border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Options</h4>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={addOption}>+ Add Option</Button>
                    <Button type="button" size="sm" variant="outline" onClick={importResourcesAsOptions}>Load Resources</Button>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <Input
                        wrapperClassName="flex-1"
                        placeholder="Value (e.g. dr_smith)"
                        value={option.value}
                        onChange={(e) => updateOption(index, 'value', e.target.value)}
                        required
                      />
                      <Input
                        wrapperClassName="flex-1"
                        placeholder="Label (e.g. Dr. Smith)"
                        value={option.label}
                        onChange={(e) => updateOption(index, 'label', e.target.value)}
                        required
                      />
                      <Input
                        wrapperClassName="w-24"
                        placeholder="Cap."
                        type="number"
                        value={option.capacity || ''}
                        onChange={(e) => updateOption(index, 'capacity', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 mt-1"
                        onClick={() => removeOption(index)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  {options.length === 0 && <p className="text-sm text-gray-500 text-center py-2">No options added</p>}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
              <Button type="submit">Save Field</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{resource.id ? 'Edit Resource' : 'Add Resource'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Resource Type"
              value={formData.resource_type}
              onChange={(e) => setFormData({ ...formData, resource_type: e.target.value })}
              options={resourceTypes}
            />

            <Input
              label="Resource Name"
              value={formData.resource_name}
              onChange={(e) => setFormData({ ...formData, resource_name: e.target.value })}
              placeholder="e.g., Dr. John Smith"
              required
            />

            <Input
              label="Resource Code (optional)"
              value={formData.resource_code || ''}
              onChange={(e) => setFormData({ ...formData, resource_code: e.target.value })}
              placeholder="e.g., DOC001"
            />

            <Textarea
              label="Description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />

            <Input
              label="Capacity per Time Slot"
              type="number"
              min={1}
              value={formData.capacity_per_slot}
              onChange={(e) => setFormData({ ...formData, capacity_per_slot: parseInt(e.target.value) })}
              description="How many appointments can this resource handle simultaneously?"
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
              <Button type="submit">Save Resource</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
