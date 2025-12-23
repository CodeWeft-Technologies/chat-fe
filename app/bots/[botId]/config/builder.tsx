
export type Win = { day: string; start: string; end: string };

export default function Builder({ value, onChange }: { value: Win[]; onChange: (val: Win[]) => void }) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  const handleDayChange = (day: string, checked: boolean) => {
    if (checked) {
      // Remove any existing entry for this day (case-insensitive) to avoid duplicates
      const others = value.filter(v => (v.day || "").trim().toLowerCase() !== day.toLowerCase());
      onChange([...others, { day, start: "09:00", end: "17:00" }]);
    } else {
      onChange(value.filter(v => (v.day || "").trim().toLowerCase() !== day.toLowerCase()));
    }
  };

  const handleChange = (day: string, field: 'start' | 'end', val: string) => {
    onChange(value.map(v => (v.day || "").trim().toLowerCase() === day.toLowerCase() ? { ...v, [field]: val } : v));
  };

  const setWeekdays = () => {
    const newDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(d => ({ day: d, start: "09:00", end: "17:00" }));
    // Filter out any existing weekdays from the value to avoid duplicates if we are "resetting" weekdays
    const nonWeekdays = value.filter(v => !["monday", "tuesday", "wednesday", "thursday", "friday"].includes((v.day || "").trim().toLowerCase()));
    onChange([...nonWeekdays, ...newDays]);
  };

  const clearAll = () => onChange([]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <button onClick={setWeekdays} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors">
          Set Weekdays (9-5)
        </button>
        <button onClick={clearAll} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors">
          Clear All
        </button>
      </div>
      <div className="space-y-2 border border-gray-100 rounded-lg p-3 bg-gray-50/50">
        {days.map(day => {
          // Case-insensitive match to be safe, also handle whitespace
          const win = value.find(v => (v.day || "").trim().toLowerCase() === day.toLowerCase());
          const isActive = !!win;
          return (
            <div key={day} className={`flex items-center gap-4 text-sm p-2 rounded transition-all ${isActive ? 'bg-white shadow-sm border border-gray-200' : 'opacity-60 hover:opacity-100'}`}>
              <div className="w-32 flex items-center gap-2">
                <input 
                    type="checkbox" 
                    checked={isActive} 
                    onChange={e => handleDayChange(day, e.target.checked)} 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                />
                <span className={isActive ? "font-medium text-gray-900" : "text-gray-500"}>{day}</span>
              </div>
              {isActive ? (
                <div className="flex items-center gap-2">
                  <input type="time" value={win.start} onChange={e => handleChange(day, 'start', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs focus:border-blue-500 outline-none" />
                  <span className="text-gray-400">-</span>
                  <input type="time" value={win.end} onChange={e => handleChange(day, 'end', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs focus:border-blue-500 outline-none" />
                </div>
              ) : (
                <span className="text-gray-400 text-xs italic">Unavailable</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
