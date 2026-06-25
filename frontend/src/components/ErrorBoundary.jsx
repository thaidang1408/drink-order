import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Không tải được trang</h1>
          <p style={{ marginTop: 8, color: '#57534e' }}>
            Thử mở lại link hoặc dùng Chrome/Safari thay vì trình duyệt trong Zalo/Facebook.
          </p>
          <pre
            style={{
              marginTop: 12,
              padding: 12,
              background: '#f5f5f4',
              borderRadius: 8,
              fontSize: 12,
              overflow: 'auto',
            }}
          >
            {this.state.error.message}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
