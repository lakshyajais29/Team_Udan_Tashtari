import { Component } from 'react';

/** Keeps one failing section from blanking the whole site. */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Team Udan-Tashtari UI error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="panel p-8 my-10 text-center" role="alert">
          <p className="eyebrow">Subsystem fault</p>
          <h2 className="text-2xl font-semibold mt-3">This module hit an error</h2>
          <p className="text-slate-400 mt-2">The rest of the site is still operational.</p>
          <button className="btn btn-primary mt-6" onClick={() => this.setState({ error: null })}>
            Restart module
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
