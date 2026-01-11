import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@flexicarz.com'

serve(async (req) => {
  try {
    const { record } = await req.json()
    
    // Get user details
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    const { data: user } = await supabase.auth.admin.getUserById(record.user_id)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('user_id', record.user_id)
      .single()
    
    // Get document public URL
    const { data: urlData } = await supabase.storage
      .from('documents')
      .createSignedUrl(record.document_url, 604800) // 7 days
    
    const documentUrl = urlData?.signedUrl || ''
    const userName = profile?.full_name || user?.email || 'Unknown User'
    const userEmail = user?.email || 'N/A'
    
    // Approval link
    const approvalLink = `${Deno.env.get('PUBLIC_URL') || 'http://localhost:5500'}/admin-documents.html`
    
    // Send email using Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'FlexiCarz <noreply@flexicarz.com>',
        to: [ADMIN_EMAIL],
        subject: `🚗 New Document Verification Request - ${userName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
              .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
              .info-row:last-child { border-bottom: none; }
              .label { font-weight: bold; color: #666; }
              .value { color: #333; }
              .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 10px 5px; font-weight: bold; }
              .document-preview { margin: 20px 0; text-align: center; }
              .document-preview img { max-width: 100%; border-radius: 8px; border: 2px solid #ddd; }
              .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚗 FlexiCarz Admin</h1>
                <p>New Document Verification Request</p>
              </div>
              <div class="content">
                <h2>User Details</h2>
                <div class="info-box">
                  <div class="info-row">
                    <span class="label">Name:</span>
                    <span class="value">${userName}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Email:</span>
                    <span class="value">${userEmail}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Document Type:</span>
                    <span class="value">Driving License</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Submitted:</span>
                    <span class="value">${new Date(record.created_at).toLocaleString()}</span>
                  </div>
                </div>
                
                <h3>Document Preview</h3>
                <div class="document-preview">
                  <a href="${documentUrl}" target="_blank">
                    <img src="${documentUrl}" alt="Document" style="max-height: 400px;" />
                  </a>
                  <p><a href="${documentUrl}" target="_blank">View Full Size</a></p>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${approvalLink}" class="btn">Review & Approve Document</a>
                </div>
                
                <div class="footer">
                  <p>This is an automated notification from FlexiCarz Admin System</p>
                  <p>Please review the document and approve/reject from the admin panel</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      })
    })
    
    const data = await res.json()
    
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
