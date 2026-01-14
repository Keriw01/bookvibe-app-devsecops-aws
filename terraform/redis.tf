# Definiuje grupę podsieci dla klastra ElastiCache.
resource "aws_elasticache_subnet_group" "main" {
  name       = "bookvibe-redis-subnet-group"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]

  tags = {
    Name = "BookVibe Redis Subnet Group"
  }
}

# Tworzy klaster ElastiCache dla Redis.
resource "aws_elasticache_cluster" "main" {
  cluster_id           = "bookvibe-redis-cluster"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379

  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis_sg.id]

  transit_encryption_enabled = false

  snapshot_retention_limit = 0

  tags = {
    Name = "BookVibe-Redis"
  }
}