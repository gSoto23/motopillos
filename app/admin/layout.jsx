export const metadata = {
  title: 'Admin Dashboard | Motopillos',
};

export default function AdminLayout({ children }) {
  return (
    <div style={{ backgroundColor: '#050505', minHeight: '100vh', padding: 0, margin: 0 }}>
      {children}
    </div>
  );
}
