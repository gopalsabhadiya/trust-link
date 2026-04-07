import { prisma } from "../config";

export interface IHealthRepository {
  checkDatabaseConnection(): Promise<boolean>;
}

export class HealthRepository implements IHealthRepository {
  async checkDatabaseConnection(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
