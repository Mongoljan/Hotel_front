/**
 * API Functions with caching support
 */

import { fetchWithCache } from './apiCache';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.kacc.mn';

// Cache TTL configurations (in milliseconds)
const CACHE_TTL = {
  USER_TYPES: 24 * 60 * 60 * 1000, // 24 hours - rarely changes
  WORKERS: 5 * 60 * 1000, // 5 minutes
  HOTEL_INFO: 10 * 60 * 1000, // 10 minutes
  ROOMS: 5 * 60 * 1000, // 5 minutes
};

export interface UserType {
  pk: number;
  name: string;
}

export interface Worker {
  id: number;
  hotel: number;
  name: string;
  position: string;
  contact_number: string;
  email: string;
  token: string;
  token_created_at: string;
  approved: boolean;
  user_type: number;
}

export interface WorkerApproval {
  user: number;
  approved: boolean;
}

/**
 * Fetch user types (Manager, Owner, Reception, etc.)
 * Cached for 24 hours as this data rarely changes
 */
export async function getUserTypes(): Promise<UserType[]> {
  try {
    const data = await fetchWithCache<UserType[]>(
      `${API_BASE_URL}/api/user-type/`,
      { method: 'GET' },
      CACHE_TTL.USER_TYPES
    );
    return data;
  } catch (error) {
    console.error('Error fetching user types:', error);
    throw error;
  }
}

/**
 * Get user type name by ID
 */
export async function getUserTypeName(userTypeId: number): Promise<string> {
  const userTypes = await getUserTypes();
  const userType = userTypes.find(ut => ut.pk === userTypeId);
  return userType?.name || 'Unknown';
}

/**
 * Fetch all workers for the hotel
 * Uses the same endpoint as sign-up API
 */
export async function getWorkers(token: string): Promise<Worker[]> {
  console.warn('Workers list endpoint not available in backend yet');
  return [];
}


















/**
 * Approve or reject a worker
 */
export async function updateWorkerApproval(
  workerId: number,
  approved: boolean,
  token: string
): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/workers/${workerId}/approve/?token=${encodeURIComponent(token)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: workerId,
          approved,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update worker approval: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating worker approval:', error);
    throw error;
  }
}

/**
 * Create a new worker (Manager or Reception)
 */
export async function createWorker(
  workerData: {
    name: string;
    position: string;
    contact_number: string;
    email: string;
    user_type: number;
  },
  token: string
): Promise<Worker> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/signup/?token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workerData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create worker');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating worker:', error);
    throw error;
  }
}

/**
 * Update worker information
 */
export async function updateWorker(
  workerId: number,
  workerData: Partial<{
    name: string;
    position: string;
    contact_number: string;
    email: string;
    user_type: number;
  }>,
  token: string
): Promise<Worker> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/workers/${workerId}/?token=${encodeURIComponent(token)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workerData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update worker');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating worker:', error);
    throw error;
  }
}

/**
 * Delete a worker
 */
export async function deleteWorker(workerId: number, token: string): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/workers/${workerId}/?token=${encodeURIComponent(token)}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete worker: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting worker:', error);
    throw error;
  }
}
