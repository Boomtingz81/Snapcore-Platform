// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://xmjvykfyjeeptiwbkfbi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtanZ5a2Z5amVlcHRpd2JrZmJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODg1MzcsImV4cCI6MjA2Nzg2NDUzN30.IV2ZrkBl4OpaZjhjkq1v0qG5lIdoxmsAbXbAAFAlMLM"
);
