// 1. Definimos la interfaz basada en los requerimientos de la tarea (se mantiene igual)
export interface AuthResponse {
    token: string;
    userId: string;
    email: string;
}

// 2. Función para registrar un nuevo usuario
export const registro = async (email: string, password: string): Promise<AuthResponse> => {

    // 3. Usamos fetch para hacer la petición al backend. Fetch recibe la URL y un objeto de configuración.
    const respuesta = await fetch('/api/v1/auth/register', {
        method: 'POST', // Especificamos que es una petición de tipo POST
        headers: {
            // Le decimos al backend que le estamos enviando datos en formato JSON
            'Content-Type': 'application/json',
        },
        // 4. Convertimos nuestro objeto de datos a una cadena de texto JSON
        body: JSON.stringify({ email, password }),
    });

    // 5. Validamos si la respuesta del servidor fue exitosa (códigos 200-299)
    if (!respuesta.ok) {
        // Intentamos extraer el mensaje de error que mande el backend (ej: "Email ya existe")
        let errorMessage = 'Ocurrió un error en el servidor';
        try {
            const errorData = await respuesta.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            // Si el backend no devuelve un JSON, nos quedamos con el mensaje por defecto
        }

        // Lanzamos el error para que pueda ser atrapado en el bloque catch de tu componente
        throw new Error(errorMessage);
    }

    // 6. Si todo salió bien, convertimos la respuesta del servidor de JSON a un objeto JavaScript
    const data: AuthResponse = await respuesta.json();

    // 7. Retornamos los datos (el token, userId y email)
    return data;
};