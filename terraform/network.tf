# Definiuje główną, izolowaną sieć wirtualną dla całej infrastruktury.
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = { Name = "bookvibe-vpc" }
}

# Definiuje podsieci publiczne, które mają bezpośredni dostęp do internetu.
# Będą w nich umieszczone zasoby takie jak Load Balancer i instancje EC2 dla Elastic Beanstalk.
resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${data.aws_region.current.name}a"
  map_public_ip_on_launch = true
  tags = {
    Name = "bookvibe-public-a"
  }
}

# Druga podsieć w innej strefie dostępności dla zapewnienia wysokiej dostępności.
resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${data.aws_region.current.name}b"
  map_public_ip_on_launch = true
  tags = {
    Name = "bookvibe-public-b"
  }
}

# Definiuje bramę internetową, która umożliwia komunikację VPC z internetem.
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "bookvibe-igw"
  }
}

# Definiuje tabelę routingu dla podsieci publicznych.
# Kieruje cały ruch wychodzący (0.0.0.0/0) do bramy internetowej.
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = {
    Name = "bookvibe-public-rt"
  }
}

# Powiązuje tabelę routingu z podsieciami publicznymi.
resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}
resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}

# Definiuje podsieci prywatne, które nie mają bezpośredniego dostępu z internetu.
# Zostaną w nich umieszczone wrażliwe zasoby, takie jak baza danych i cache Redis.
resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "${data.aws_region.current.name}a"
  tags = { Name = "bookvibe-private-a" }
}
resource "aws_subnet" "private_b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = "${data.aws_region.current.name}b"
  tags = { Name = "bookvibe-private-b" }
}

resource "aws_eip" "nat" {
  domain = "vpc"
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_a.id
  tags          = { Name = "bookvibe-nat-gw" }
  depends_on    = [aws_internet_gateway.main]
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }
  tags = { Name = "bookvibe-private-rt" }
}

resource "aws_route_table_association" "private_a" {
  subnet_id      = aws_subnet.private_a.id
  route_table_id = aws_route_table.private.id
}
resource "aws_route_table_association" "private_b" {
  subnet_id      = aws_subnet.private_b.id
  route_table_id = aws_route_table.private.id
}

# Definiuje grupę bezpieczeństwa (firewall) dla bazy danych RDS.
resource "aws_security_group" "db_sg" {
  name   = "bookvibe-db-sg"
  vpc_id = aws_vpc.main.id
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "bookvibe-db-sg" }
}

# Definiuje grupę bezpieczeństwa dla ElastiCache Redis.
resource "aws_security_group" "redis_sg" {
  name   = "bookvibe-redis-sg"
  vpc_id = aws_vpc.main.id
  egress { 
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags   = { Name = "bookvibe-redis-sg" }
}

# Definiuje grupę bezpieczeństwa dla instancji EC2 tworzonych przez Elastic Beanstalk.
resource "aws_security_group" "beanstalk_sg" {
  name   = "bookvibe-beanstalk-sg"
  vpc_id = aws_vpc.main.id

  # Reguła przychodząca: zezwala na ruch HTTP z dowolnego miejsca w internecie.
  # Ten ruch będzie najpierw obsługiwany przez Load Balancer.
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # Reguła przychodząca: zezwala na ruch SSH tylko z określonego adresu IP.
  # Uniemożliwia inne próby logowania.
  ingress {
    description = "Allow SSH from my IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip_address]
  }

  # Zezwala na cały ruch wychodzący.
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "bookvibe-beanstalk-sg" }
}

# Definiuje regułę, która pozwala instancjom Beanstalk na komunikację z bazą danych RDS.
resource "aws_security_group_rule" "beanstalk_to_db" {
  type                     = "ingress"
  from_port                = 3306
  to_port                  = 3306
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.beanstalk_sg.id # Źródło: instancje aplikacji
  security_group_id        = aws_security_group.db_sg.id # Cel: baza danych
}

# Definiuje regułę, która pozwala instancjom Beanstalk na komunikację z Redis.
resource "aws_security_group_rule" "beanstalk_to_redis" {
  type                     = "ingress"
  from_port                = 6379
  to_port                  = 6379
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.beanstalk_sg.id # Źródło: instancje aplikacji
  security_group_id        = aws_security_group.redis_sg.id # Cel: Redis
}