export function validatePassword(password: string): string | null {

    if (password.length < 8) {
        return 'La contraseña debe tener al menos 8 caracteres.'
    }

    if (!/[A-Z]/.test(password)) {
        return 'La contraseña debe contener una letra mayúscula.'
    }

    if (!/[a-z]/.test(password)) {
        return 'La contraseña debe contener una letra minúscula.'
    }

    if (!/[0-9]/.test(password)) {
        return 'La contraseña debe contener un número.'
    }

    if (!/[!@#$%^&*()_\-+=[\]{};:"\\|,.<>/?]/.test(password)) {
        return 'La contraseña debe contener un carácter especial.'
    }

    return null
}
