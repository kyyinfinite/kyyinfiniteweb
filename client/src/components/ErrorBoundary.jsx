import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'Unknown error' };
  }

  componentDidCatch(error, info) {
    console.error('KyyInfinite render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            fontFamily: 'system-ui, sans-serif',
            textAlign: 'center',
            backgroundColor: '#F4F7F6',
          }}
        >
          <div>
            <p style={{ fontSize: 56, fontWeight: 600, color: '#50C8C2', margin: 0 }}>500</p>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#2C3E50', margin: '16px 0 8px' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#6B7B8D', fontSize: 14, maxWidth: 420, margin: '0 auto' }}>
              {this.state.errorMessage}
            </p>
            <p style={{ color: '#9BAEBF', fontSize: 12, marginTop: 12 }}>
              If this keeps happening, check that all VITE_FIREBASE_* environment variables are set.
            </p>
            <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
              <a
                href="/"
                style={{
                  background: '#50C8C2',
                  color: '#fff',
                  fontWeight: 500,
                  padding: '10px 20px',
                  borderRadius: 12,
                  textDecoration: 'none',
                  fontSize: 14,
                }}
              >
                Back to Home
              </a>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: 'none',
                  color: '#50C8C2',
                  fontWeight: 500,
                  padding: '10px 20px',
                  borderRadius: 12,
                  border: '1px solid #50C8C2',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
