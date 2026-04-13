import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/mockStore';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end   = searchParams.get('end');
  const today = searchParams.get('today') ?? new Date().toISOString().split('T')[0];

  if (start && end) {
    return NextResponse.json({
      occupancy: store.getOccupancy(start, end),
      stats:     store.getTodayStats(today),
    });
  }

  // Default: current week occupancy (7 days from today)
  const todayDate  = new Date(today);
  const startDate  = today;
  const endDate    = new Date(todayDate);
  endDate.setDate(endDate.getDate() + 7);

  return NextResponse.json({
    occupancy: store.getOccupancy(startDate, endDate.toISOString().split('T')[0]),
    stats:     store.getTodayStats(today),
  });
}
