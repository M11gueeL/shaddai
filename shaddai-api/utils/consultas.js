// para registrar un paciente
paciente = {
  "full_name": "Elias Lopez", 
  "cedula": "12222333",
  "birth_date": "1980-12-04",
  "gender": "Masculino",
  "marital_status": "Casado",
  "address": "Santa Rita",
  "phone": "04121234523",
  "email": "email@example.com",
  "created_by": 6
}

// el formato de fecha es YYYY-MM-DD 2000-12-31

// para un usuario recepcionista '3' o admin '1'
usuario = {
    "first_name": "Eduardo Alfonso",
    "last_name": "Lopez Castillo",
    "cedula": "11222333",
    "birth_data" :"2000-12-31",
    "gender": "Masculino",
    "address": "Ubicacion cualquiera",
    "phone": "04121234522",
    "email": "example@example.com",
    "password": "123456",
    "roles": [1, 3]
}

usuarioMedico = {
    "first_name": "Nombre",
    "last_name": "Apellido",
    "cedula": "12345678",
    "birth_data" :"2000-12-31",
    "gender": "Masculino",
    "address": "Ubicacion cualquiera",
    "phone": "04141234567",
    "email": "email@example.com",
    "password": "contraseña",
    "roles": [2],  // El id del rol medico es 2
    "mpps_code": "141013",
    "medical_college_id": 4,
    "college_code": 12756,
    "specialties": [1, 32]  // array con ids de especialidades
}


