
import { prisma } from '@/lib/db';

export async function getCustomers() {
  try {
    const customers = await (prisma as any).customers.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return customers;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customers.');
  }
}

export async function getCustomerById(id: string) {
  try {
    const customer = await (prisma as any).customers.findUnique({
      where: { id: Number(id) },
    });
    return customer;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customer.');
  }
}
