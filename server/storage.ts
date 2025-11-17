import type { ProcessingJob } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createJob(originalFilename: string): Promise<ProcessingJob>;
  getJob(id: string): Promise<ProcessingJob | undefined>;
  updateJob(id: string, updates: Partial<ProcessingJob>): Promise<ProcessingJob | undefined>;
}

export class MemStorage implements IStorage {
  private jobs: Map<string, ProcessingJob>;

  constructor() {
    this.jobs = new Map();
  }

  async createJob(originalFilename: string): Promise<ProcessingJob> {
    const id = randomUUID();
    const job: ProcessingJob = {
      id,
      status: 'extracting',
      progress: 0,
      originalFilename,
    };
    this.jobs.set(id, job);
    return job;
  }

  async getJob(id: string): Promise<ProcessingJob | undefined> {
    return this.jobs.get(id);
  }

  async updateJob(id: string, updates: Partial<ProcessingJob>): Promise<ProcessingJob | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;

    const updatedJob = { ...job, ...updates };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }
}

export const storage = new MemStorage();
