import { Component } from "react";
import { Link } from "react-router-dom";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-state error">
          <h1>Something went wrong</h1>
          <p>This page could not be displayed. Please refresh or return to the shop.</p>
          <Link className="button dark" to="/">Go to shop</Link>
        </div>
      );
    }

    return this.props.children;
  }
}
