export async function getCachedData<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMinutes = 60
): Promise<T> {

    const cached = localStorage.getItem(key)

    if (cached) {

        try {
            const parsed = JSON.parse(cached)
            const now = Date.now()

            if (now < parsed.expiresAt) {
                return parsed.data as T
            }

        } catch {
            //
        }
    }

    const data = await fetcher()

    localStorage.setItem(
        key,
        JSON.stringify({
            data,
            expiresAt:
                Date.now() +
                ttlMinutes * 60 * 1000,
        })
    )

    return data
}