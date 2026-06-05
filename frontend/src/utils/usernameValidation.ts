export function usernameValidation(
    username: string,
): string | null {

    if (username.length < 3) {
        return 'El nombre de usuario debe tener al menos 3 caracteres.'
    }

    if (
        !/^[A-Za-z0-9][A-Za-z0-9._\-!?]*$/.test(username)
    ) {
        return (
            'Debe comenzar con una letra o número y solo puede contener . _ - ! ?'
        )
    }

    return null
}
