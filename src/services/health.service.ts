import { DataSource } from 'typeorm';

export class HealthService {
    constructor(private readonly dataSource: DataSource) {}

    checkHealth = async () => {
        return {
            status: 'up',
            services: {
                // Usamos una propiedad nativa de TypeORM para chequear salud
                database: this.dataSource.isInitialized
                    ? 'connected'
                    : 'disconnected',
                uptime: Math.floor(process.uptime()) + 's',
            },
        };
    };
}
