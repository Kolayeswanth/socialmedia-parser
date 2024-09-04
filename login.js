import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0';

const supabaseUrl = 'https://zjewonjkqltszkneslaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZXdvbmprcWx0c3prbmVzbGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUzNTA0MzUsImV4cCI6MjA0MDkyNjQzNX0.D-exu9NUi0au4fdmHZAgAO9XHLLk-Cxns2CdsHg8s_k';
const supabase = createClient(supabaseUrl, supabaseKey);
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log('Form submitted with email:', email, 'password:', password);

    try {
        // Now check if the user can be logged in with the credentials
        const { data: userData, error } = await supabase
            .from('info')
            .select('*')
            .eq('email', email)
            .eq('password', password);

        if (error || userData.length === 0) {
            console.error('Login failed:', error);
            alert('Login failed: Invalid credentials');
        } else {
            console.log('Login successful:', userData);
            alert('Login successful!');
            window.location.href = 'index.html'; // Redirect after successful login
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    }
});