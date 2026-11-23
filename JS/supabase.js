const { createClient } = supabase;

export const banco = createClient(
    config.url,
    config.publishableKey
);