# Movie Manager NoSQL

API REST de películas usando DynamoDB en lugar de MySQL. Mismos endpoints que `movie_manager` pero con almacenamiento NoSQL.

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/movies` | Crear película |
| GET | `/movies` | Listar todas |
| GET | `/movies/:id` | Obtener por ID |
| PATCH | `/movies/:id` | Actualizar |
| DELETE | `/movies/:id` | Eliminar |
| GET | `/health` | Health check |

## Desarrollo local con Docker Compose

### Levantar los servicios

```bash
cd movie_manager_nosql
docker compose up --build
```

### Crear una película

```bash
curl -X POST http://localhost:3000/movies \
  -H "Content-Type: application/json" \
  -d '{"title": "Inception", "release_year": 2010, "genre": "Sci-Fi", "director": "Christopher Nolan"}'
```

### Listar películas

```bash
curl http://localhost:3000/movies
```

### Ver datos directamente en DynamoDB local

```bash
aws --endpoint-url=http://localhost:4566 dynamodb scan \
  --table-name movies --region us-east-1
```

### Detener

```bash
docker compose down
```
