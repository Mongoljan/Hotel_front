import { NextRequest, NextResponse } from 'next/server';
import { store, CleaningStatus, CleaningPriority } from '@/lib/mockStore';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const cleaning_status = searchParams.get('cleaning_status') as CleaningStatus | null;
  const priority        = searchParams.get('priority') as CleaningPriority | null;
  const floor           = searchParams.get('floor');

  const tasks = store.getHousekeepingTasks({
    ...(cleaning_status ? { cleaning_status } : {}),
    ...(priority ? { priority } : {}),
    ...(floor ? { floor: Number(floor) } : {}),
  });

  return NextResponse.json({ results: tasks, count: tasks.length });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const task = store.createHousekeepingTask(body);
  return NextResponse.json(task, { status: 201 });
}
