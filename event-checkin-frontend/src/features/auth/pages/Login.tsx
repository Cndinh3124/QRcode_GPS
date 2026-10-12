import Đăng nhậpForm from '../components/Đăng nhậpForm';

export default function Đăng nhập() {
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
      <Đăng nhậpForm />
    </div>
  );
}