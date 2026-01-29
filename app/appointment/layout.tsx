import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Appointment Portal",
  description: "Book, reschedule, check status, or cancel your appointments",
};

export default function AppointmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}