data "aws_region" "current" {}

# Pobranie informacje o istniejącym sekrecie
data "aws_secretsmanager_secret" "app_secrets" {
    name = "/secret/bookvibe/application"
}

data "aws_secretsmanager_secret_version" "app_secrets_value" {
  secret_id = data.aws_secretsmanager_secret.app_secrets.id
}