
export type Win = { day: string; start: string; end: string };

export default function Builder({ value, onChange }: { value: Win[]; onChange: (val: Win[]) => void }) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  const handleDayChange = (day: string, checked: boolean) => {
    if (checked) {
      onChange([...value, { day, start: "09:00", end: "17:00" }]);
    } else {
      onChange(value.filter(v => v.day !== day));
    }
  };

  const handleChange = (day: string, field: 'start' | 'end', val: string) => {
    onChange(value.map(v => v.day === day ? { ...v, [field]: val } : v));
  };

  return (
    <div className="space-y-2">
      {days.map(day => {
        const win = value.find(v => v.day === day);
        const isActive = !!win;
        return (
          <div key={day} className="flex items-center gap-4 text-sm">
            <div className="w-32 flex items-center gap-2">
              <input type="checkbox" checked={isActive} onChange={e => handleDayChange(day, e.target.checked)} className="rounded border-gray-300" />
              <span className={isActive ? "font-medium text-gray-900" : "text-gray-500"}>{day}</span>
            </div>
            {isActive ? (
              <div className="flex items-center gap-2">
                <input type="time" value={win.start} onChange={e => handleChange(day, 'start', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs" />
                <span className="text-gray-400">-</span>
                <input type="time" value={win.end} onChange={e => handleChange(day, 'end', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs" />
              </div>
            ) : (
              <span className="text-gray-400 text-xs italic">Unavailable</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
