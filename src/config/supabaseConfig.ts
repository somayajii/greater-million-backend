

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
 "https://yxfbgexhutixaptgvbum.supabase.co", // Supabase URL
 "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZmJnZXhodXRpeGFwdGd2YnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU5MTE0MSwiZXhwIjoyMDg4MTY3MTQxfQ.fS2HDZ2VipHwZfxLmpDj1cRqWWewPIKJycQvjZTOUG4"
 
);