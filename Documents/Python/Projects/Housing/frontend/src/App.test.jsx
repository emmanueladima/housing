// Minimal test App - if this works, the issue is in one of the components
function App() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#f97316', minHeight: '100vh', color: 'white' }}>
      <h1 style={{ fontSize: '48px', fontWeight: 'bold' }}>EdYOU is Working! 🎉</h1>
      <p style={{ fontSize: '24px', marginTop: '20px' }}>
        If you see this, React is rendering correctly.
      </p>
      <p style={{ fontSize: '18px', marginTop: '20px' }}>
        The blank page issue is likely in one of the imported components.
      </p>
    </div>
  );
}

export default App;



