import prisma from '../lib/prisma';

export class DatabaseUtils {
  private isConnected = false;

  async connect() {
    if (!this.isConnected) {
      await prisma.$connect();
      this.isConnected = true;
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await prisma.$disconnect();
      this.isConnected = false;
    }
  }

  async cleanAll() {
    await prisma.contactRequest.deleteMany();
    await prisma.review.deleteMany();
    await prisma.case.deleteMany();
    await prisma.service.deleteMany();
    await prisma.banner.deleteMany();
    await prisma.adminUser.deleteMany();
  }

  // Service helpers
  createService(data: any) {
    return prisma.service.create({ data });
  }

  getServices() {
    return prisma.service.findMany();
  }

  getServiceById(id: string) {
    return prisma.service.findUnique({ where: { id } });
  }

  updateService(id: string, data: any) {
    return prisma.service.update({ where: { id }, data });
  }

  deleteService(id: string) {
    return prisma.service.delete({ where: { id } });
  }

  // Case helpers
  createCase(data: any) {
    return prisma.case.create({ data });
  }

  getCases() {
    return prisma.case.findMany();
  }

  getCaseById(id: string) {
    return prisma.case.findUnique({ where: { id } });
  }

  updateCase(id: string, data: any) {
    return prisma.case.update({ where: { id }, data });
  }

  deleteCase(id: string) {
    return prisma.case.delete({ where: { id } });
  }

  // Review helpers
  createReview(data: any) {
    return prisma.review.create({ data });
  }

  getReviews() {
    return prisma.review.findMany();
  }

  getReviewById(id: string) {
    return prisma.review.findUnique({ where: { id } });
  }

  updateReview(id: string, data: any) {
    return prisma.review.update({ where: { id }, data });
  }

  deleteReview(id: string) {
    return prisma.review.delete({ where: { id } });
  }

  // Contact helpers
  createContactRequest(data: any) {
    return prisma.contactRequest.create({ data });
  }

  getContactRequests() {
    return prisma.contactRequest.findMany();
  }

  // Admin user helpers
  createAdminUser(data: any) {
    return prisma.adminUser.create({ data });
  }

  getAdminUsers() {
    return prisma.adminUser.findMany();
  }

  getAdminUserByEmail(email: string) {
    return prisma.adminUser.findUnique({ where: { email } });
  }

  // Database health checks
  async healthCheck() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  // Transaction helpers
  async withTransaction<T>(fn: () => Promise<T>): Promise<T> {
    return prisma.$transaction(fn);
  }

  // Database stats
  async getStats() {
    const [services, cases, reviews, contacts, users] = await Promise.all([
      prisma.service.count(),
      prisma.case.count(),
      prisma.review.count(),
      prisma.contactRequest.count(),
      prisma.adminUser.count(),
    ]);

    return {
      services,
      cases,
      reviews,
      contacts,
      users,
    };
  }
}