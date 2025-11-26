// Simple Document Verification for School Project

function validateDocument(file) {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  // Check file type
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload JPG, PNG, or PDF only' };
  }

  // Check file size
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  return { valid: true };
}

// Store document for manual verification
async function submitDocumentForVerification(userId, file) {
  const validation = validateDocument(file);
  
  if (!validation.valid) {
    return { success: false, message: validation.error };
  }

  try {
    // Upload to storage
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await window.supabase.storage.from('documents').upload(fileName, file);
    if (error) throw error;

    // Save to database
    const { data: docData, error: docError } = await window.supabase
      .from('user_documents')
      .insert([
        {
          user_id: userId,
          document_url: data.path,
          status: 'pending',
        },
      ]);

    if (docError) {
      console.error('Database error:', docError);
      return { success: false, message: 'Database not configured. Contact admin.' };
    }

    return { 
      success: true, 
      message: 'Document uploaded successfully! Awaiting admin verification.' 
    };
  } catch (err) {
    console.error('Upload error:', err);
    return { success: false, message: 'Upload failed. Please try again.' };
  }
}

// Admin: Approve/Reject document
async function updateDocumentStatus(docId, status) {
  const { data, error } = await window.supabase
    .from('user_documents')
    .update({ status: status, verified_at: new Date().toISOString() })
    .eq('id', docId);

  if (error) {
    return false;
  }

  return true;
}