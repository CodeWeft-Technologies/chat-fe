"use client";
import { useState, useEffect } from "react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { use as usePromise } from "react";

interface BookingDetails {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  resource_name?: string;
  status: string;
  form_data?: Record<string, unknown>;
  created_at: string;
}

export default function UnifiedBookingPage({ params }: { params: Promise<{ botId: string }> }) {
  const { botId } = usePromise(params as Promise<{ botId: string }>);
  const [tab, setTab] = useState("book");
  const [appointmentId, setAppointmentId] = useState("");
  const [statusResult, setStatusResult] = useState<BookingDetails | null>(null);
  const [cancelResult, setCancelResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orgId, setOrgId] = useState("");

  // Get org_id from URL params or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orgFromUrl = urlParams.get('org_id');
    const orgFromStorage = localStorage.getItem('orgId');
    setOrgId(orgFromUrl || orgFromStorage || 'default-org');
  }, []);

  const handleStatusCheck = async () => {
    if (!appointmentId.trim()) {
      setError("Please enter an appointment ID");
      return;
    }

    setLoading(true);
    setError("");
    setStatusResult(null);

    try {
      const response = await fetch(`/api/booking/${appointmentId}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Appointment not found');
      }

      const booking = await response.json();
      setStatusResult(booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch appointment status');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!appointmentId.trim()) {
      setError("Please enter an appointment ID");
      return;
    }

    if (!confirm("Are you sure you want to cancel this appointment? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    setError("");
    setCancelResult("");

    try {
      const response = await fetch(`/api/bookings/${appointmentId}/cancel`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          org_id: orgId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to cancel appointment');
      }

      setCancelResult("✅ Appointment cancelled successfully");
      // Clear the appointment ID after successful cancellation
      setAppointmentId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel appointment');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      case 'completed': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment Portal</h1>
          <p className="text-gray-600">Book, reschedule, check status, or cancel your appointments</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <div className="flex gap-1">
              <Button 
                variant={tab === "book" ? "primary" : "ghost"} 
                onClick={() => setTab("book")}
                className="px-6 py-2"
              >
                📅 Book
              </Button>
              <Button 
                variant={tab === "reschedule" ? "primary" : "ghost"} 
                onClick={() => setTab("reschedule")}
                className="px-6 py-2"
              >
                🔄 Reschedule
              </Button>
              <Button 
                variant={tab === "status" ? "primary" : "ghost"} 
                onClick={() => setTab("status")}
                className="px-6 py-2"
              >
                📋 Status
              </Button>
              <Button 
                variant={tab === "cancel" ? "primary" : "ghost"} 
                onClick={() => setTab("cancel")}
                className="px-6 py-2"
              >
                ❌ Cancel
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          {tab === "book" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Book New Appointment</h2>
              <iframe 
                src={`/api/form/${botId}?org_id=${orgId}`} 
                className="w-full h-[700px] border-0 rounded-lg" 
                title="Booking Form"
                style={{ minHeight: '700px' }}
              />
            </div>
          )}

          {tab === "reschedule" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Reschedule Appointment</h2>
              <iframe 
                src={`/api/reschedule/${botId}?org_id=${orgId}`} 
                className="w-full h-[700px] border-0 rounded-lg" 
                title="Reschedule Form"
                style={{ minHeight: '700px' }}
              />
            </div>
          )}

          {tab === "status" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Check Appointment Status</h2>
              
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment ID
                  </label>
                  <Input 
                    value={appointmentId} 
                    onChange={e => setAppointmentId(e.target.value)} 
                    placeholder="Enter your appointment ID (e.g., 12345)" 
                    className="text-center"
                  />
                </div>
                
                <Button 
                  onClick={handleStatusCheck} 
                  disabled={loading || !appointmentId.trim()}
                  className="w-full"
                >
                  {loading ? "Checking..." : "Check Status"}
                </Button>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {statusResult && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Appointment Details</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(statusResult.status)}`}>
                          {statusResult.status?.toUpperCase()}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Appointment ID</p>
                          <p className="font-semibold">#{statusResult.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Customer</p>
                          <p className="font-semibold">{statusResult.customer_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-semibold">{formatDate(statusResult.booking_date)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Time</p>
                          <p className="font-semibold">
                            {formatTime(statusResult.start_time)} - {formatTime(statusResult.end_time)}
                          </p>
                        </div>
                        {statusResult.resource_name && (
                          <div>
                            <p className="text-sm text-gray-600">Service/Provider</p>
                            <p className="font-semibold">{statusResult.resource_name}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-600">Contact</p>
                          <p className="font-semibold">{statusResult.customer_email}</p>
                          {statusResult.customer_phone && (
                            <p className="text-sm text-gray-500">{statusResult.customer_phone}</p>
                          )}
                        </div>
                      </div>
                      
                      {statusResult.form_data && Object.keys(statusResult.form_data).length > 0 && (
                        <div className="pt-4 border-t">
                          <p className="text-sm text-gray-600 mb-2">Additional Details</p>
                          <div className="bg-gray-50 p-3 rounded-md">
                            {Object.entries(statusResult.form_data).map(([key, value]) => (
                              <div key={key} className="flex justify-between py-1">
                                <span className="text-sm text-gray-600 capitalize">
                                  {key.replace(/_/g, ' ')}:
                                </span>
                                <span className="text-sm font-medium">
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-4 border-t">
                        <p className="text-xs text-gray-500">
                          Booked on {new Date(statusResult.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {tab === "cancel" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Cancel Appointment</h2>
              
              <div className="max-w-md mx-auto space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                  <p className="text-red-800 text-sm">
                    ⚠️ <strong>Warning:</strong> Cancelling an appointment cannot be undone. 
                    Please make sure you have the correct appointment ID.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment ID
                  </label>
                  <Input 
                    value={appointmentId} 
                    onChange={e => setAppointmentId(e.target.value)} 
                    placeholder="Enter your appointment ID (e.g., 12345)" 
                    className="text-center"
                  />
                </div>
                
                <Button 
                  onClick={handleCancel} 
                  disabled={loading || !appointmentId.trim()}
                  variant="destructive"
                  className="w-full"
                >
                  {loading ? "Cancelling..." : "Cancel Appointment"}
                </Button>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {cancelResult && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-600 text-sm">{cancelResult}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Need help? Contact our support team for assistance.</p>
        </div>
      </div>
    </div>
  );
}
