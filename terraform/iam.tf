# Definiuje rolę dla usługi Elastic Beanstalk.
# Ta rola jest używana przez samą usługę EB do monitorowania i zarządzania zasobami środowiska.
resource "aws_iam_role" "beanstalk_service_role" {
  name = "bookvibe-beanstalk-service-role"

  # Polityka zaufania, która pozwala usłudze EB przyjąć tę rolę.
  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Effect    = "Allow",
      Principal = { Service = "elasticbeanstalk.amazonaws.com" },
      Action    = "sts:AssumeRole"
    }]
  })
}

# Dołącza polityki zarządzane przez AWS do roli serwisowej.
# AWSElasticBeanstalkEnhancedHealth - pozwala na zaawansowane monitorowanie Health.
# AWSElasticBeanstalkService - zapewnia podstawowe uprawnienia do zarządzania środowiskiem.
resource "aws_iam_role_policy_attachment" "beanstalk_service_health" {
  role       = aws_iam_role.beanstalk_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth"
}

resource "aws_iam_role_policy_attachment" "beanstalk_service_managed" {
  role       = aws_iam_role.beanstalk_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkService"
}

# Definiuje rolę dla instancji EC2 tworzonych przez Elastic Beanstalk.
# Ta rola jest przypisywana do maszyn wirtualnych, na których działają kontenery.
resource "aws_iam_role" "beanstalk_ec2_role" {
  name = "bookvibe-beanstalk-ec2-role"
  
  # Polityka zaufania - pozwala instancjom EC2 przyjąć tę rolę.
  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Effect    = "Allow",
      Principal = { Service = "ec2.amazonaws.com" },
      Action    = "sts:AssumeRole"
    }]
  })
}

# Tworzy "profil instancji", który jest kontenerem na rolę IAM i może być przypisany do instancji EC2 podczas jej startu.
resource "aws_iam_instance_profile" "beanstalk_instance_profile" {
  name = "bookvibe-beanstalk-instance-profile"
  role = aws_iam_role.beanstalk_ec2_role.name
}

# Dołącza polityki do roli instancji, nadając im konkretne uprawnienia, dołączane są tylko niezbędne polityki.
resource "aws_iam_role_policy_attachment" "beanstalk_ec2_ecr_readonly" {
  role       = aws_iam_role.beanstalk_ec2_role.name

  # Pozwala instancjom na pobieranie obrazów Docker z Amazon ECR.
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy_attachment" "beanstalk_ec2_cloudwatch" {
  role       = aws_iam_role.beanstalk_ec2_role.name

  # Pozwala instancjom na wysyłanie logów i metryk do CloudWatch
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

resource "aws_iam_role_policy_attachment" "beanstalk_ec2_multicontainer" {
  role       = aws_iam_role.beanstalk_ec2_role.name

  # Wymagana polityka dla środowisk wielokontenerowych
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker"
}

resource "aws_iam_role_policy_attachment" "beanstalk_ec2_s3_access" {
  role       = aws_iam_role.beanstalk_ec2_role.name

  # Pozwala instancjom na dostęp do S3, np. w celu pobrania konfiguracji lub logowania.
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

# Polityka inline, która pozwala na odczyt sekretu.
resource "aws_iam_role_policy" "beanstalk_read_secrets" {
  name = "AllowReadBookVibeSecrets"
  role = aws_iam_role.beanstalk_ec2_role.id

  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = "secretsmanager:GetSecretValue",
        Resource = data.aws_secretsmanager_secret.app_secrets.arn
      }
    ]
  })
}