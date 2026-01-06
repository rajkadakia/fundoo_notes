# FundooNotes Backend - Redis Setup Guide

## Prerequisites

Redis is installed on your Ubuntu/WSL system but needs to be started.

## Starting Redis Server

### Option 1: Start Redis in WSL (Recommended for Development)

Open a separate terminal and run:

```bash
wsl
sudo service redis-server start
```

Or to run Redis in the foreground:

```bash
wsl redis-server
```

### Option 2: Start Redis as Background Service

```bash
wsl sudo service redis-server start
```

To check if Redis is running:

```bash
wsl redis-cli ping
```

Expected output: `PONG`

## Environment Variables

Add these to your `.env` file (optional, defaults are provided):

```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Testing Redis Connection

After starting Redis, test the connection:

```bash
npm test
```

## Redis Caching Features

The application now includes:

- **Cached Notes**: Initial 20 notes per user are cached
- **Cache Invalidation**: Automatic cache clearing on create/update/delete
- **Filtered Caching**: Separate caches for archived, trashed, and labeled notes
- **Pagination Support**: Query parameters `page` and `limit`

## API Endpoints

### Get All Notes (Cached)

```
GET /api/notes?page=1&limit=20
```

### Get Archived Notes (Cached)

```
GET /api/notes/archived?page=1&limit=20
```

### Get Trashed Notes (Cached)

```
GET /api/notes/trash?page=1&limit=20
```

### Get Notes by Label (Cached)

```
GET /api/notes/label/:labelId?page=1&limit=20
```

### Toggle Pin Note

```
PUT /api/notes/:id/pin
```

## Troubleshooting

If Redis connection fails:

1. Ensure Redis is running: `wsl redis-cli ping`
2. Check Redis logs: `wsl sudo tail -f /var/log/redis/redis-server.log`
3. Restart Redis: `wsl sudo service redis-server restart`

The application will continue to work without Redis, but caching will be disabled.
