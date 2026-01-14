#  Definicja prywatnego repozytorium dla obrazu backendu.
resource "aws_ecr_repository" "backend" {
  name                 = "bookvibe-backend"
  # Ustawienie polityki mutowalności tagów. "MUTABLE" pozwala na nadpisywanie tagów, np. wielokrotne wypychanie obrazu z tym samym tagiem 'latest'.
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    # Włącza automatyczne skanowanie obrazu w poszukiwaniu znanych podatności (CVE) za każdym razem, gdy nowy obraz jest wypychany  do repozytorium.
    scan_on_push = true
  }
}

# Definicja prywatnego repozytorium dla obrazu frontendu.
resource "aws_ecr_repository" "frontend" {
  name                 = "bookvibe-frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}