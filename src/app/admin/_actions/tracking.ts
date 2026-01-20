'use server';

import { prisma } from '@/lib/db';

export async function trackCheckoutEvent(data: {
  userId?: number;
  orderTotal: number;
  orderId: string;
  itemCount: number;
  email: string;
}) {
  try {
    await prisma.analytics_events.create({
      data: {
        eventType: 'checkout_completed',
        userId: data.userId,
        eventData: {
          orderTotal: data.orderTotal,
          orderId: data.orderId,
          itemCount: data.itemCount,
          email: data.email,
        },
      },
    });
  } catch (error) {
    console.error('Error tracking checkout event:', error);
  }
}

export async function trackUserRegistration(data: {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}) {
  try {
    await prisma.analytics_events.create({
      data: {
        eventType: 'user_registered',
        userId: data.userId,
        eventData: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          companyName: data.companyName,
        },
      },
    });
  } catch (error) {
    console.error('Error tracking user registration:', error);
  }
}

export async function trackQuoteRequest(data: {
  quoteId: string;
  userId?: number;
  reference: string;
  email: string;
  itemCount: number;
  estimatedValue?: number;
}) {
  try {
    await prisma.analytics_events.create({
      data: {
        eventType: 'quote_requested',
        userId: data.userId,
        eventData: {
          quoteId: data.quoteId,
          reference: data.reference,
          email: data.email,
          itemCount: data.itemCount,
          estimatedValue: data.estimatedValue,
        },
      },
    });
  } catch (error) {
    console.error('Error tracking quote request:', error);
  }
}

export async function trackNewsletterSignup(data: {
  email: string;
  source: string;
}) {
  try {
    // Create/update newsletter subscriber
    await prisma.newsletter_subscribers.upsert({
      where: { email: data.email },
      update: {
        status: 'active',
      },
      create: {
        email: data.email,
        source: data.source,
        status: 'active',
        metadata: {
          signupDate: new Date().toISOString(),
        },
      },
    });

    // Track event
    await prisma.analytics_events.create({
      data: {
        eventType: 'newsletter_signup',
        eventData: {
          email: data.email,
          source: data.source,
        },
      },
    });
  } catch (error) {
    console.error('Error tracking newsletter signup:', error);
  }
}

export async function trackFormSubmission(data: {
  formSubmissionId?: string;
  formType: string;
  email: string;
  name: string;
  message?: string;
  phone?: string;
  company?: string;
  subject?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await prisma.analytics_events.create({
      data: {
        eventType: 'form_submitted',
        eventData: {
          formSubmissionId: data.formSubmissionId,
          formType: data.formType,
          email: data.email,
          name: data.name,
          message: data.message,
          phone: data.phone,
          company: data.company,
          subject: data.subject,
        },
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  } catch (error) {
    console.error('Error tracking form submission:', error);
  }
}

export async function trackProductView(data: {
  productId: number;
  userId?: number;
  ipAddress?: string;
}) {
  try {
    await prisma.product_views.create({
      data: {
        productId: data.productId,
        userId: data.userId,
        ipAddress: data.ipAddress,
      },
    });

    await prisma.analytics_events.create({
      data: {
        eventType: 'product_viewed',
        userId: data.userId,
        eventData: {
          productId: data.productId,
        },
        ipAddress: data.ipAddress,
      },
    });
  } catch (error) {
    console.error('Error tracking product view:', error);
  }
}

export async function trackSearchQuery(data: {
  query: string;
  userId?: number;
  resultCount: number;
}) {
  try {
    await prisma.search_queries.create({
      data: {
        query: data.query,
        userId: data.userId,
        results: data.resultCount,
      },
    });

    await prisma.analytics_events.create({
      data: {
        eventType: 'search_performed',
        userId: data.userId,
        eventData: {
          query: data.query,
          resultCount: data.resultCount,
        },
      },
    });
  } catch (error) {
    console.error('Error tracking search query:', error);
  }
}

// Notification tracking
export async function createNotification(data: {
  userId: number;
  type: string;
  message: string;
  link?: string;
}) {
  try {
    const notification = await prisma.notifications.create({
      data: {
        userId: data.userId,
        type: data.type,
        message: data.message,
        link: data.link,
        isRead: false,
      },
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

export async function updateUserLastLogin(userId: number) {
  try {
    await prisma.users.update({
      where: { id: userId },
      data: {
        lastLogin: new Date(),
        isNewUser: false,
      },
    });
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}
