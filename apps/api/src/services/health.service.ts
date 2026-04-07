import type { IHealthRepository } from "../repositories";

interface HealthStatus {
  status: "healthy" | "degraded";
  timestamp: string;
  database: boolean;
  version: string;
}

export interface IHealthService {
  getHealthStatus(): Promise<HealthStatus>;
}

export class HealthService implements IHealthService {
  constructor(private readonly healthRepository: IHealthRepository) {}

  async getHealthStatus(): Promise<HealthStatus> {
    const dbConnected = await this.healthRepository.checkDatabaseConnection();

    return {
      status: dbConnected ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      database: dbConnected,
      version: "0.1.0",
    };
  }
}
