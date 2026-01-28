"use client";
import { useState } from "react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { use as usePromise } from "react";

export default function UnifiedBookingPage({ params }: { params: Promise<{ botId: string }> }) {
  const { botId } = usePromise(params as Promise<{ botId: string }>);
  const [tab, setTab] = useState("book");
  const [appointmentId, setAppointmentId] = useState("");
  const [statusResult, setStatusResult] = useState("");
  const [cancelResult, setCancelResult] = useState("");

  // ...existing code for booking and reschedule forms (reuse your form components or embed the forms via iframe)

  const handleStatusCheck = async () => {
    setStatusResult("Loading...");
    // Call backend API for status
    const r = await fetch(`/api/chat/appointment-status/${botId}?appointment_id=${appointmentId}`);
    const t = await r.text();
    setStatusResult(t);
  };

  const handleCancel = async () => {
    setCancelResult("Processing...");
    // Call backend API for cancel
    const r = await fetch(`/api/chat/appointment-cancel/${botId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointment_id: appointmentId })
    });
    const t = await r.text();
    setCancelResult(t);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">
      <h1 className="text-2xl font-bold text-center mb-6">Unified Appointment Portal</h1>
      <div className="flex justify-center gap-4 mb-6">
        <Button variant={tab === "book" ? "primary" : "outline"} onClick={() => setTab("book")}>Book</Button>
        <Button variant={tab === "reschedule" ? "primary" : "outline"} onClick={() => setTab("reschedule")}>Reschedule</Button>
        <Button variant={tab === "status" ? "primary" : "outline"} onClick={() => setTab("status")}>Status</Button>
        <Button variant={tab === "cancel" ? "primary" : "outline"} onClick={() => setTab("cancel")}>Cancel</Button>
      </div>
      {tab === "book" && (
        <iframe src={`/api/chat/booking-form/${botId}`} className="w-full h-[600px] border rounded" title="Booking Form" />
      )}
      {tab === "reschedule" && (
        <iframe src={`/api/chat/reschedule-form/${botId}`} className="w-full h-[600px] border rounded" title="Reschedule Form" />
      )}
      {tab === "status" && (
        <div className="space-y-3">
          <Input value={appointmentId} onChange={e => setAppointmentId(e.target.value)} placeholder="Enter Appointment ID" />
          <Button onClick={handleStatusCheck}>Check Status</Button>
          {statusResult && <div className="mt-2 text-sm text-gray-700">{statusResult}</div>}
        </div>
      )}
      {tab === "cancel" && (
        <div className="space-y-3">
          <Input value={appointmentId} onChange={e => setAppointmentId(e.target.value)} placeholder="Enter Appointment ID" />
          <Button onClick={handleCancel} variant="destructive">Cancel Appointment</Button>
          {cancelResult && <div className="mt-2 text-sm text-red-700">{cancelResult}</div>}
        </div>
      )}
    </div>
  );
}
