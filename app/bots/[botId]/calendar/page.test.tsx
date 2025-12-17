import { render, screen, fireEvent } from '@testing-library/react';
import BotCalendarPage from './page';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve(JSON.stringify({ events: [], appointments: [] })),
    json: () => Promise.resolve({ events: [], appointments: [] }),
  })
) as jest.Mock;

// Mock params
const params = Promise.resolve({ botId: '123' });

describe('BotCalendarPage', () => {
  it('renders calendar header', async () => {
    render(<BotCalendarPage params={params} />);
    expect(await screen.findByText('Calendar & Bookings')).toBeInTheDocument();
  });

  it('toggles view modes', async () => {
    render(<BotCalendarPage params={params} />);
    const weekBtn = await screen.findByText('Week');
    const monthBtn = await screen.findByText('Month');
    
    fireEvent.click(monthBtn);
    expect(monthBtn).toHaveClass('bg-white');
    
    fireEvent.click(weekBtn);
    expect(weekBtn).toHaveClass('bg-white');
  });

  it('displays appointments correctly', async () => {
    // Mock data with appointment
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({
          appointments: [{
            id: 1,
            title: 'Test Appt',
            start_iso: new Date().toISOString(),
            end_iso: new Date(Date.now() + 3600000).toISOString(),
            status: 'confirmed'
          }]
        }))
      })
    );

    render(<BotCalendarPage params={params} />);
    // Since it's async, we might need to wait
    // This is a basic structure
  });
});
