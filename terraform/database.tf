# Definiuje grupę podsieci dla bazy danych. RDS wymaga tej grupy, aby wiedzieć, w których podsieciach i strefach dostępności może umieszczać instancje bazy danych.
resource "aws_db_subnet_group" "main" {
  name       = "bookvibe-db-subnet-group"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]

  tags = {
    Name = "BookVibe DB Subnet Group"
  }
}

locals {
  db_secrets = jsondecode(data.aws_secretsmanager_secret_version.app_secrets_value.secret_string)
}

# Tworzy właściwą instancję bazy danych MySQL w usłudze RDS.
resource "aws_db_instance" "main" {
  identifier          = "bookvibe-db-instance"
  engine              = "mysql"
  engine_version      = "8.0"
  instance_class      = "db.t3.micro"
  allocated_storage   = 20
  db_name             = "bookvibe_db"
  username            = "rootuser"
  password            = local.db_secrets["spring.datasource.password"]

  db_subnet_group_name = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db_sg.id] # Przypisanie grupy bezpieczeństwa (firewall).
  publicly_accessible  = false # Baza nie jest dostępna z publicznego internetu.

  # Włącza szyfrowanie danych w spoczynku dla bazy danych i jej snapshotów.
  storage_encrypted   = true

  # Ustawiono na 0 z powodu ograniczeń AWS Free Tier, który nie wspiera automatycznych backupów.
  backup_retention_period = 0
  skip_final_snapshot = true
  
  multi_az            = false
  deletion_protection = false

  tags = {
    Name = "BookVibe-Database"
  }
}