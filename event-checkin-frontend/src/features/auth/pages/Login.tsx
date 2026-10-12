import LoginForm from '../components/LoginForm';

export default function Login() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'var(--color-page)',
      }}
    >
      <LoginForm />
    </div>
  );
}