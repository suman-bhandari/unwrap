export default function SimpleTestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Simple Test Page</h1>
      <p>If you can see this page, the basic Next.js server is working.</p>
      <p>This page has no complex components or imports that might cause header issues.</p>
      <a href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>
        Try Login Page
      </a>
    </div>
  );
}

