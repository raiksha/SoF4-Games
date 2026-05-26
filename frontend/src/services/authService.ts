export interface AuthResponse {
    token: string;
    userId: string;
    email: string;
}

export const registro = async (email: string, password: string): Promise<AuthResponse> => {

    const respuesta = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!respuesta.ok) {
        let errorMessage = 'Ocurrió un error en el servidor';
        try {
            const errorData = await respuesta.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
        }

        throw new Error(errorMessage);
    }

    const data: AuthResponse = await respuesta.json();

    return data;
};