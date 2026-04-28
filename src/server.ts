import "reflect-metadata";
import dotenv from 'dotenv';
import { AppDataSource } from "./data-source";
import { app } from "./app";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        AppDataSource.initialize()
            .then(() => {
                console.log('✓ Conexión a la base de datos establecida');
            })
            .catch((error: Error) => {
                console.error('𐄂 Error al conectar a la base de datos:', error);
            });

        const server = app.listen(PORT, () => {
            console.log(`✓ Servidor corriendo en http://localhost:${PORT}`);
            console.log(`✓ Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log(
                `✓ API Health Check: http://localhost:${PORT}/api/hello`
            );
        });

        // Manejo de señales de cierre graceful
        const shutdownHandler = () => {
            console.log('\n✓ Recibida señal de cierre. Cerrando servidor...');
            server.close(() => {
                console.log('✓ Servidor cerrado correctamente');
                process.exit(0);
            });
        };

        process.on('SIGTERM', shutdownHandler);
        process.on('SIGINT', shutdownHandler);
    } catch (error) {
        console.error('𐄂 Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();
