import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://opdjfhgniuzfpqpormah.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_0fzBqTsoBuE-oLqZ7VV35Q_FIXwBdnP"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
