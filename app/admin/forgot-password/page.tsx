import ForgotPasswordForm from './ForgotPasswordForm';

export const metadata = { title: 'Reset Password — Olabode' };

export default function ForgotPasswordPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
      fontFamily: 'var(--font-inter, Inter, sans-serif)',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '2.5rem',
        width: 'min(400px, 92vw)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{
            fontFamily: 'var(--font-playfair, "Playfair Display", serif)',
            fontStyle: 'italic',
            fontSize: '1.5rem',
            fontWeight: 500,
            marginBottom: '0.5rem',
          }}>Olabode</p>
          <p style={{ fontSize: '0.85rem', color: '#666' }}>
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
