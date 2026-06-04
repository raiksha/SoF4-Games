const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1'

export interface AuthResponse {
    token: string;
    email: string;
    username: string;
}

export const register = async (email: string, password: string, username: string): Promise<AuthResponse> => {
    const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username }),
    });

    if (!response.ok) {
        let errorMessage = 'Ocurrió un error en el servidor';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch {
            // The server did not return a valid JSON.
        }

        throw new Error(errorMessage);
    }

    const data: AuthResponse = await response.json();

    return data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        let errorMessage = 'Ocurrió un error en el servidor';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch {
            // The server did not return a valid JSON.
        }

        throw new Error(errorMessage);
    }

    const data: AuthResponse = await response.json();

    return data;
};

export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    const response = await fetch(`${BASE_URL}/auth/check-username?username=${encodeURIComponent(username)}`)

    if (!response.ok) {
        let errorMessage = 'No se pudo verificar el nombre de usuario';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch {
            // The server did not return a valid JSON.
        }

        throw new Error(errorMessage);
    }
    
    return response.json()
}
