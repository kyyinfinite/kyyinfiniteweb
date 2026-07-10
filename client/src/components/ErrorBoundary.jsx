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
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: '#2C3E50', marginBottom: 12 }}>
              Something failed to load
            </h1>
            <p style={{ color: '#6B7B8D', fontSize: 14, maxWidth: 420 }}>{this.state.errorMessage}</p>
            <p style={{ color: '#9BAEBF', fontSize: 12, marginTop: 16 }}>
              Check that all VITE_FIREBASE_* environment variables are set.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
