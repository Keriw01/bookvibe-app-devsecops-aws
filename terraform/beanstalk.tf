# Definicja "aplikacji" w Elastic Beanstalk.
resource "aws_elastic_beanstalk_application" "main" {
  name        = "bookvibe-app"
  description = "BookVibe Application"
}

# Definicja "środowiska" w Elastic Beanstalk. Aplikacja wraz z całą infrastrukturą (instancje EC2, Load Balancer, itp.).
resource "aws_elastic_beanstalk_environment" "main" {
  name                = "bookvibe-env"
  application         = aws_elastic_beanstalk_application.main.name
  solution_stack_name = "64bit Amazon Linux 2023 v4.2.9 running ECS"

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "SecurityGroups"
    value     = aws_security_group.beanstalk_sg.id
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.beanstalk_instance_profile.name
  }
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = "t3.micro"
  }

  setting {
      namespace = "aws:autoscaling:launchconfiguration"
      name      = "RootVolumeType"
      value     = "gp3"
  }
    setting {
      namespace = "aws:autoscaling:launchconfiguration"
      name      = "RootVolumeSize"
      value     = "20"
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = aws_vpc.main.id # Uruchomienie środowiska w stworzonym VPC.
  }
  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    # Przypisanie instancje EC2 do podsieci publicznych.
    value     = join(",", [aws_subnet.public_a.id, aws_subnet.public_b.id])
  }
  setting {
    namespace = "aws:ec2:vpc"
    name      = "ELBSubnets"
    # Umieszczenie Application Load Balancer w podsieciach publicznych.
    value     = join(",", [aws_subnet.public_a.id, aws_subnet.public_b.id])
  }

  # Konfiguracja typu środowiska i Load Balancera.
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "LoadBalanced"
  }
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "LoadBalancerType"
    value     = "application"
  }
    setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "ServiceRole"
    value     = aws_iam_role.beanstalk_service_role.arn
  }

  # Te zmienne są wstrzykiwane do kontenerów w czasie uruchomienia. Pozwala to na oddzielenie konfiguracji od kodu aplikacji.
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name = "SPRING_DATASOURCE_URL"
    value = "jdbc:mysql://${aws_db_instance.main.address}:${aws_db_instance.main.port}/${aws_db_instance.main.db_name}?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name = "SPRING_DATASOURCE_USERNAME"
    value = aws_db_instance.main.username
  }

    setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name = "SPRING_DATA_REDIS_HOST"
    value = aws_elasticache_cluster.main.cache_nodes[0].address
  }
    setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name = "SPRING_DATA_REDIS_PORT"
    value = tostring(aws_elasticache_cluster.main.cache_nodes[0].port)
  }

  # Konfiguracja dostępu SSH
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "EC2KeyName"
    value     = "bookvibe-ssh-key"
  }
}