# Movie Manager Worker

Worker que recibe datos de películas y los almacena en DynamoDB.

## Desarrollo local con Docker Compose

### Levantar los servicios

```bash
cd movie_manager_worker
docker compose up --build
```

Esto levanta:
- **LocalStack** con DynamoDB emulado en el puerto `4566`
- **movie_manager_worker** en el puerto `3000`

La tabla `movie-manager-test` se crea automáticamente al iniciar LocalStack.

### Enviar una película al worker

```bash
curl -X POST http://localhost:3000/process-message \
  -H "Content-Type: application/json" \
  -d '{"title": "Inception", "release_year": 2010, "genre": "Sci-Fi", "director": "Christopher Nolan"}'
```

### Ver los datos en DynamoDB local

```bash
aws --endpoint-url=http://localhost:4566 dynamodb scan \
  --table-name movie-manager-test --region us-east-1
```

### Detener los servicios

```bash
docker compose down
```
