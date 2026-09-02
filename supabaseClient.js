// Supabase Configuration
const supabaseUrl = 'https://ghglgtmfwcjophzulvgg.supabase.co';
const supabaseKey = 'sb_publishable_-u4qK2iK-3-IbnFrN-9p0w_oAjKGLmy';

// Initialize the Supabase client
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// You can optionally export it if you're using ES modules, but for simple scripts included via <script> tags, 
// the `supabase` variable will just be available globally.
// export default supabase;
