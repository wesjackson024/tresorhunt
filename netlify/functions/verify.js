const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const { token } = event.queryStringParameters || {};

  if (!token) {
    return redirect('/?verified=invalid');
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data, error } = await supabase
    .from('landing_waitlist')
    .update({ verified: true, token: null })
    .eq('token', token)
    .select()
    .single();

  if (error || !data) {
    return redirect('/?verified=invalid');
  }

  return redirect('/?verified=true');
};

function redirect(url) {
  return {
    statusCode: 302,
    headers: { Location: url },
    body: '',
  };
}
