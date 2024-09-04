import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zjewonjkqltszkneslaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZXdvbmprcWx0c3prbmVzbGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUzNTA0MzUsImV4cCI6MjA0MDkyNjQzNX0.D-exu9NUi0au4fdmHZAgAO9XHLLk-Cxns2CdsHg8s_k';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;