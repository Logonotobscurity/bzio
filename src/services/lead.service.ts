/**
 * Lead Service
 *
 * Business logic layer for CRM leads.
 * Handles lead management, status tracking, and pipeline logistics.
 */

import { leadRepository } from '@/repositories';
import type { Prisma, LeadSource, LeadStatus } from '@prisma/client';

// Use repository type directly instead of domain type
type Lead = Prisma.leadsGetPayload<{}>;

interface CreateLeadInput {
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string; // For backward compatibility
  phone?: string;
  companyName?: string;
  source: LeadSource | string;
  status?: LeadStatus | string;
  notes?: string;
}

interface UpdateLeadInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
  source?: LeadSource | string;
  status?: LeadStatus | string;
  notes?: string;
  score?: number;
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

    const [firstName, lastName] = input.name ? input.name.split(' ') : [input.firstName, input.lastName];

    return (await leadRepository.create({
      email: input.email,
      firstName: firstName || input.firstName,
      lastName: lastName || input.lastName,
      phone: input.phone,
      company: input.companyName,
      source: (input.source as LeadSource) || 'WEBSITE',
      status: (input.status as LeadStatus) || 'NEW',
      notes: input.notes,
    })) as unknown as Lead;
  }

  /**
   * Get all leads
   */
  async getAllLeads(limit?: number, skip?: number): Promise<Lead[]> {
    return (await leadRepository.findAll(limit, skip)) as unknown as Lead[];
  }

  /**
   * Get lead by ID
   */
  async getLeadById(id: string | number): Promise<Lead | null> {
    return (await leadRepository.findById(id)) as unknown as Lead | null;
  }

  /**
   * Get lead by email
   */
  async getLeadByEmail(email: string): Promise<Lead | null> {
    return (await leadRepository.findByEmail(email)) as unknown as Lead | null;
  }

  /**
   * Get leads by status
   */
  async getLeadsByStatus(status: string): Promise<Lead[]> {
    return (await leadRepository.findByStatus(status)) as unknown as Lead[];
  }

  /**
   * Get leads by source
   */
  async getLeadsBySource(source: string): Promise<Lead[]> {
    return (await leadRepository.findBySource(source)) as unknown as Lead[];
  }

  /**
   * Update lead
   */
  async updateLead(id: string | number, input: UpdateLeadInput): Promise<Lead> {
    return (await leadRepository.update(id, input)) as unknown as Lead;
  }

  /**
   * Update lead status
   */
  async updateLeadStatus(id: string | number, status: string): Promise<Lead> {
    return (await leadRepository.update(id, { status })) as unknown as Lead;
  }

  /**
   * Delete lead
   */
  async deleteLead(id: string | number): Promise<boolean> {
    return await leadRepository.delete(id);
  }

  /**
   * Get lead count
   */
  async getLeadCount(): Promise<number> {
    return (await leadRepository.count()) || 0;
  }

  /**
   * Get lead count by status
   */
  async getLeadCountByStatus(status: string): Promise<number> {
    return (await leadRepository.countByStatus(status)) || 0;
  }

  /**
   * Get lead count by source
   */
  async getLeadCountBySource(source: string): Promise<number> {
    const all = await leadRepository.findAll();
    return (all || []).filter(l => l.source === source).length;
  }

  /**
   * Get sales pipeline summary
   */
  async getSalesPipeline(): Promise<
    Array<{ status: string; count: number; percentage: number }>
  > {
    const allLeads = await leadRepository.findAll();
    if (!allLeads || allLeads.length === 0) {
      return [];
    }

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
    if (!allLeads || allLeads.length === 0) {
      return [];
    }

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
    return (await leadRepository.update(id, { status: 'CONVERTED' })) as unknown as Lead;
  }

  /**
   * Validate lead input
   */
  private validateLeadInput(input: CreateLeadInput): void {
    if (!input.email?.trim()) {
      throw new Error('Email is required');
    }
    if (!input.name?.trim() && !input.firstName?.trim()) {
      throw new Error('Name is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      throw new Error('Invalid email format');
    }
  }
}

export const leadService = new LeadService();
