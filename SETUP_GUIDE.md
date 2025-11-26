# Car Rental System - Complete Setup Guide

## Document Verification System Implementation

### Features Implemented:

1. **User Document Upload** (verify-documents.html)
   - Users can upload 3 required documents:
     - Driving License
     - Aadhaar Card
     - Profile Photo
   - Files are stored in Supabase storage bucket
   - Status tracking: pending → submitted → verified/rejected

2. **Admin Document Review** (admin-documents.html)
   - Admins can view all submitted documents
   - Filter by status (pending, approved, rejected)
   - View document preview
   - Approve or reject documents
   - Automatic user verification status update

3. **Booking Protection**
   - Users cannot book until documents are verified
   - Booking page checks verification status
   - Redirects unverified users to document upload page

### Database Schema Required:

```sql
-- user_documents table (already exists)
CREATE TABLE user_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  document_url text NOT NULL,
  document_type varchar,
  status varchar DEFAULT 'pending',
  verified_at timestamp,
  created_at timestamp DEFAULT now()
);

-- user_profiles table (already exists)
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  full_name varchar NOT NULL,
  phone varchar,
  role varchar DEFAULT 'user',
  verification_status varchar DEFAULT 'pending',
  documents_submitted_at timestamp,
  verified_at timestamp,
  created_at timestamp DEFAULT now()
);
```

### Supabase Storage Setup:

1. Create a new bucket named "documents"
2. Set bucket to public (for viewing documents)
3. Add RLS policy to allow authenticated users to upload

### File Structure:

```
Car-Rental/
├── verify-documents.html      (User document upload page)
├── admin-documents.html       (Admin document review page)
├── booking.html              (Updated with verification check)
├── script.js                 (Updated booking logic)
├── supabase.js               (Supabase configuration)
└── style.css                 (Styling)
```

### User Flow:

1. **User Registration/Login**
   - User signs up/logs in
   - Redirected to home page

2. **Document Verification**
   - User clicks "Verify Documents" button
   - Uploads 3 required documents
   - Documents stored in Supabase bucket
   - Status set to "submitted"
   - User sees "Under Review" message

3. **Admin Review**
   - Admin logs in to admin-documents.html
   - Reviews pending documents
   - Approves or rejects each document
   - If all documents approved → user verification_status = "verified"
   - If any rejected → user verification_status = "pending"

4. **Booking**
   - User can only book if verification_status = "verified"
   - If not verified, redirected to document upload page
   - After verification, can proceed with booking

### Key Functions:

**verify-documents.html:**
- `checkVerificationStatus()` - Check current verification status
- Document upload with Supabase storage
- Automatic status update to "submitted"

**admin-documents.html:**
- `loadDocuments()` - Load all documents with filters
- `approveDocument()` - Approve document and update user status
- `rejectDocument()` - Reject document and reset user status
- `getDocumentUrl()` - Generate public document URL

**booking.html:**
- `checkVerification()` - Check if user is verified before showing booking form

### Testing Checklist:

- [ ] User can upload documents
- [ ] Documents appear in admin panel
- [ ] Admin can approve documents
- [ ] Admin can reject documents
- [ ] User verification status updates correctly
- [ ] Unverified users cannot access booking page
- [ ] Verified users can book cars
- [ ] Document URLs are accessible

### Troubleshooting:

1. **Documents not uploading**
   - Check Supabase storage bucket exists and is public
   - Verify RLS policies allow authenticated uploads

2. **Admin cannot see documents**
   - Check admin role is set correctly in user_metadata
   - Verify user_documents table has data

3. **Verification status not updating**
   - Check user_profiles table has correct user_id
   - Verify Supabase query permissions

### Security Notes:

- Only authenticated users can upload documents
- Only admins can approve/reject documents
- Documents stored in Supabase with user_id isolation
- Booking blocked until verification complete
