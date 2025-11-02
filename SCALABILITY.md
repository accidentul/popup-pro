# Scalability and Performance Guide

This document outlines the scalability features and optimizations implemented in the Exit-Intent Popup Builder application.

## Architecture Overview

The application is designed to scale horizontally and handle high traffic loads through:

1. **Database Optimization**
2. **Caching Strategy**
3. **Connection Pooling**
4. **Rate Limiting**
5. **Efficient Query Patterns**
6. **Horizontal Scaling Support**

## Database Optimizations

### Indexes

All frequently queried columns have indexes:

- **Popups**: `shop_id`, `status`, `is_active`, `created_at`
- **Popup Views**: `popup_id`, `session_id`, `viewed_at`
- **Popup Conversions**: `popup_id`, `type`, `converted_at`
- **Discount Codes**: `shop_id`, `code`, `is_active`
- **Email Subscribers**: `shop_id`, `email`, `popup_id`, `is_active`

### Connection Pooling

PostgreSQL connection pooling is configured with:

```env
DB_POOL_MAX=20      # Maximum connections per instance
DB_POOL_MIN=5       # Minimum connections maintained
DB_IDLE_TIMEOUT=30000      # Idle timeout in milliseconds
DB_CONNECTION_TIMEOUT=10000 # Connection timeout
```

### Query Optimization

- **Aggregation Queries**: Analytics use efficient SQL aggregations instead of loading all data
- **Pagination**: List endpoints limit results (e.g., `take: 100`)
- **Selective Loading**: Only load necessary fields
- **Bulk Operations**: Use `increment()` for counters to avoid race conditions

## Caching Strategy

### Redis Cache (Production)

For production, Redis is used for distributed caching:

```env
REDIS_URL=redis://redis:6379
```

### Cache Keys and TTLs

- **Active Popups**: `active-popups:{shopId}` - 5 minutes
- **Popup Details**: `popup:{id}` - 5 minutes
- **Analytics Stats**: `stats:popup:{popupId}` - 1 minute
- **Shop Stats**: `stats:shop:{shopId}` - 1 minute

### Cache Invalidation

Caches are automatically invalidated when:
- Popups are created, updated, or deleted
- Views or conversions are tracked
- Status changes occur

### Fallback to In-Memory Cache

If Redis is not available, the application falls back to in-memory caching, which works for single-instance deployments.

## Rate Limiting

Rate limiting protects the API from abuse:

- **Analytics Tracking**: 1000 requests/minute per IP
- **Conversions**: 500 requests/minute per IP
- **Stats Endpoints**: 100 requests/minute per IP
- **Default**: 100 requests/minute per IP

Rate limits are stored in cache (Redis or in-memory) with automatic expiration.

## Horizontal Scaling

### Cloud Run Configuration

The application is configured for Cloud Run with:

```yaml
memory: 512Mi
cpu: 1
timeout: 300s
max-instances: 10
min-instances: 0  # Scale to zero when not in use
```

### Stateless Design

- All state is stored in the database
- No in-memory session storage
- Redis used for shared cache across instances

### Load Balancing

Cloud Run automatically handles:
- Request distribution across instances
- Health checks
- Auto-scaling based on traffic

## Performance Optimizations

### Response Optimization

1. **Transform Interceptor**: Removes unnecessary fields from responses
2. **Compression**: Enable gzip compression in your reverse proxy/CDN
3. **Pagination**: Limit result sets
4. **Field Selection**: Only return required fields

### Async Operations

- View count increments are async (don't block responses)
- Cache invalidation is non-blocking
- Background jobs for heavy operations (future enhancement)

### Database Connection Management

- Connection pooling prevents connection exhaustion
- Proper connection timeout handling
- Graceful degradation if database is unavailable

## Monitoring and Alerting

### Key Metrics to Monitor

1. **Response Times**
   - P50, P95, P99 latencies
   - Target: < 200ms for most endpoints

2. **Error Rates**
   - 4xx and 5xx errors
   - Target: < 0.1%

3. **Database Connections**
   - Active connections vs pool size
   - Alert if > 80% of pool used

4. **Cache Hit Rates**
   - Target: > 80% cache hit rate

5. **Rate Limit Hits**
   - Monitor for potential attacks or misconfigurations

### Recommended Tools

- **Google Cloud Monitoring**: Built-in Cloud Run metrics
- **Google Cloud Logging**: Application logs
- **Cloud SQL Insights**: Database performance
- **Application Performance Monitoring (APM)**: Consider adding Sentry or similar

## Scaling Strategies

### Vertical Scaling

Increase Cloud Run resources:

```yaml
memory: 1Gi      # Increase from 512Mi
cpu: 2          # Increase from 1
```

### Horizontal Scaling

Increase max instances:

```yaml
max-instances: 50  # Increase from 10
```

### Database Scaling

1. **Read Replicas**: Set up Cloud SQL read replicas for analytics queries
2. **Connection Pooler**: Use Cloud SQL Proxy or PgBouncer
3. **Instance Upgrade**: Increase Cloud SQL instance size

### Caching Scaling

1. **Redis Cluster**: Use Redis Cluster for high availability
2. **Cache Warming**: Pre-populate cache on deployment
3. **Cache Partitioning**: Split cache by shop ID for better distribution

## Performance Testing

### Load Testing

Use tools like:
- **k6**: Load testing with custom scenarios
- **Artillery**: API load testing
- **Google Cloud Load Testing**: Managed load testing

### Recommended Test Scenarios

1. **Normal Load**: 100 req/s sustained
2. **Peak Load**: 500 req/s for 5 minutes
3. **Spike Load**: 1000 req/s for 1 minute
4. **Stress Test**: Find breaking point

### Test Checklist

- [ ] Response times remain acceptable under load
- [ ] Error rates stay low
- [ ] Database connections don't exhaust
- [ ] Cache hit rates remain high
- [ ] Memory usage stays within limits
- [ ] CPU usage is reasonable

## Optimization Checklist

Before going to production:

- [ ] Enable Redis caching
- [ ] Configure appropriate connection pool sizes
- [ ] Set up database indexes (via migrations)
- [ ] Configure rate limits based on expected traffic
- [ ] Set up monitoring and alerting
- [ ] Load test with expected traffic patterns
- [ ] Configure Cloud Run auto-scaling
- [ ] Set up Cloud SQL read replicas (if needed)
- [ ] Enable Cloud CDN for frontend (if needed)
- [ ] Configure database backup strategy

## Troubleshooting Performance Issues

### High Response Times

1. Check database query performance
2. Verify cache is working (check hit rates)
3. Review slow query logs
4. Check connection pool utilization
5. Verify rate limiting isn't too aggressive

### High Error Rates

1. Check application logs for errors
2. Verify database connections aren't exhausted
3. Check if rate limits are being hit
4. Verify external dependencies (Redis, database) are healthy

### Memory Issues

1. Reduce cache TTL
2. Limit result set sizes
3. Review for memory leaks
4. Increase Cloud Run memory allocation

### Database Connection Issues

1. Increase connection pool size
2. Review connection timeout settings
3. Check for connection leaks
4. Consider using connection pooler (PgBouncer)

## Future Enhancements

1. **Message Queue**: Use Pub/Sub for async analytics processing
2. **CDN**: Cloud CDN for static assets
3. **Database Sharding**: Partition by shop ID for very large scale
4. **Read Replicas**: Separate read/write operations
5. **GraphQL**: Consider GraphQL for flexible querying
6. **Edge Functions**: Use Cloud Functions for lightweight operations


