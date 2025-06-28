
// API endpoints configuration for your custom storage server
// You need to implement these endpoints on your own server

export const API_ENDPOINTS = {
  // Upload endpoint - POST /api/upload
  // Headers: Authorization: Bearer {supabase_jwt_token}
  // Body: FormData with 'file' and 'userId' fields
  // Response: { url: string, filename: string }
  UPLOAD: '/api/upload',

  // Delete endpoint - DELETE /api/files/delete
  // Headers: Authorization: Bearer {supabase_jwt_token}, Content-Type: application/json
  // Body: { fileUrls: string[], userId: string }
  // Response: { success: boolean, deletedFiles: string[] }
  DELETE: '/api/files/delete',

  // Optional: Get file endpoint - GET /api/files/{filename}
  // Headers: Optional Authorization for private files
  // Response: File content with appropriate Content-Type
  GET_FILE: '/api/files'
};

// Example server implementation guide:
/*
Your server needs to implement these endpoints:

1. POST /api/upload
   - Validate the JWT token from Supabase
   - Extract userId from token or request body
   - Store file in: /uploads/{userId}/{timestamp}_{filename}
   - Return: { url: "https://yourdomain.com/api/files/{userId}/{filename}" }

2. DELETE /api/files/delete
   - Validate JWT token
   - Check if user owns the files (extract userId from file path)
   - Delete files from storage
   - Return: { success: true, deletedFiles: [...] }

3. GET /api/files/{userId}/{filename} (optional)
   - Serve files directly or redirect to CDN
   - Optionally check permissions for private files

Example folder structure on your server:
/uploads/
  /user-123/
    /timestamp1_image.jpg
    /timestamp2_document.pdf
  /user-456/
    /timestamp3_video.mp4
*/

// Helper function to extract user ID from file URL
export const extractUserIdFromUrl = (url: string): string | null => {
  try {
    const urlPath = new URL(url).pathname;
    const match = urlPath.match(/\/api\/files\/([^/]+)\//);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};
