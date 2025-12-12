import companies from '@/lib/data/companies.json';
import { Company } from '@/lib/schema';

export const findById = async (id: number): Promise<Company | undefined> => {
  return companies.find((c) => c.id === id);
};

export const all = async (): Promise<Company[]> => {
  return companies;
};
