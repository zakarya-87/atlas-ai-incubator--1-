import { JobStatusResponse } from './jobs.service';

// Simple in-memory job store for local/dev usage when BullMQ isn't configured.
const jobs = new Map<string, JobStatusResponse>();

export function setJob(id: string, status: JobStatusResponse) {
  jobs.set(id, status);
}

export function getJob(id: string): JobStatusResponse | undefined {
  return jobs.get(id);
}

export function hasJob(id: string): boolean {
  return jobs.has(id);
}

export default jobs;
