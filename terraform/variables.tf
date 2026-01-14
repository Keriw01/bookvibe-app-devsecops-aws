variable "my_ip_address" {
  type        = string
  description = "Publiczny adres IP do zezwolenia na dostęp SSH."

  validation {
    condition     = can(regex("^([0-9]{1,3}\\.){3}[0-9]{1,3}/32$", var.my_ip_address)) || var.my_ip_address == "0.0.0.0/0"
    error_message = "Adres IP musi być w formacie CIDR /32, np. '1.2.3.4/32'."
  }
}