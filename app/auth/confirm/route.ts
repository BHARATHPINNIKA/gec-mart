import { type EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// You should use your existing supabase client here
// This is a simplified example. In production, use a server-side client.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      // Redirect user to the specified URL or root
      redirect(next)
    } else {
      // Redirect to an error page with a message
      redirect('/error?message=Could not verify email')
    }
  }

  // Redirect to an error page if the token is missing
  redirect('/error?message=Invalid confirmation link')
}