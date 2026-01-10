/**
 * Lead Service
 *
 * Business logic layer for CRM leads.
 * Handles lead management, status tracking, and pipeline logistics.
 */

import { leadRepository } from '@/repositories';
import type { Lead } from '@/lib/types/domain';

interface CreateLeadInput {
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  company?: string;
  source: string;
  status?: string;
}

interface UpdateLeadInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  source?: string;
  status?: string;
  notes?: string;
}

export class LeadService {
  /**
   * Create a new lead
   */
  async createLead(input: CreateLeadInput): Promise<Lead> {
    // Validate input
    this.validateLeadInput(input);

    // Check for duplicate
    const existing = await leadRepository.findByEmail(input.email);
    if (existing) {
      throw new Error('Lead with this email already exists');
    }

    return leadRepository.create({
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      company: input.company,
      source: input.source,
      status: input.status || 'new',
    });
  }

  /**
   * Get all leads
   */
  async getAllLeads(limit?: number, skip?: number): Promise<Lead[]> {
    return leadRepository.findAll(limit, skip);
  }

  /**
   * Get total lead count
   */
  async getLeadCount(): Promise<number> {
    const all = await leadRepository.findAll();
    return all ? all.length : 0;
  }

  /**
   * Get lead by ID
   */
  async getLeadById(id: string | number): Promise<Lead | null> {
    return leadRepository.findById(id);
  }

  /**
   * Get lead by email
   */
  async getLeadByEmail(email: string): Promise<Lead | null> {
    return leadRepository.findByEmail(email);
  }

  /**
   * Get leads by status
   */
  async getLeadsByStatus(status: string): Promise<Lead[]> {
    return leadRepository.findByStatus(status);
  }

  /**
   * Get leads by source
   */
  async getLeadsBySource(source: string): Promise<Lead[]> {
    return leadRepository.findBySource(source);
  }

  /**
   * Update lead
   */
  async updateLead(id: string | number, input: UpdateLeadInput): Promise<Lead> {
    return leadRepository.update(id, input);
  }

  /**
   * Update lead status
   */
  async updateLeadStatus(id: string | number, status: string): Promise<Lead> {
    return leadRepository.update(id, { status });
  }

  /**
   * Delete lead
   */
  async deleteLead(id: string | number): Promise<boolean> {
    return leadRepository.delete(id);
  }

  /**
   * Get lead count
   */
  async getLeadCount(): Promise<number> {
    return leadRepository.count();
  }

  /**
   * Get lead count by status
   */
  async getLeadCountByStatus(status: string): Promise<number> {
    return leadRepository.countByStatus(status);
  }

  /**
   * Get lead count by source
   */
  async getLeadCountBySource(source: string): Promise<number> {
    const all = await leadRepository.findAll();
    return all.filter(l => l.source === source).length;
  }

  /**
   * Get sales pipeline summary
   */
  async getSalesPipeline(): Promise<
    Array<{ status: string; count: number; percentage: number }>
  > {
    const allLeads = await leadRepository.findAll();
    const statusCounts = new Map<string, number>();

    allLeads.forEach(lead => {
      const status = lead.status || 'unknown';
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    });

    const total = allLeads.length || 1;

    return Array.from(statusCounts.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  }

  /**
   * Get leads by source breakdown
   */
  async getLeadsBySourceBreakdown(): Promise<Array<{ source: string; count: number }>> {
    const allLeads = await leadRepository.findAll();
    const sourceCounts = new Map<string, number>();

    allLeads.forEach(lead => {
      sourceCounts.set(lead.source, (sourceCounts.get(lead.source) || 0) + 1);
    });

    return Array.from(sourceCounts.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Convert lead to customer (placeholder for integration)
   */
  async convertLead(id: string | number): Promise<Lead> {
    return leadRepository.update(id, { status: 'converted' });
  }

  /**
   * Validate lead input
   */
  private validateLeadInput(input: CreateLeadInput): void {
    if (!input.email?.trim()) {
      throw new Error('Email is required');
    }
    if (!input.firstName?.trim()) {
      throw new Error('First name is required');
    }
    if (!input.source?.trim()) {
      throw new Error('Lead source is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      throw new Error('Invalid email format');
    }
  }
}

export const leadService = new LeadService();
