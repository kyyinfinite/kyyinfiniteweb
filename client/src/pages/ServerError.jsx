import React from 'react';
import ErrorPage from './ErrorPage.jsx';

export default function ServerError() {
  return (
    <ErrorPage
      code="500"
      title="Something went wrong on our end"
      message="The server hit an unexpected error. It's been logged. Try again in a moment, or head back home."
      showRetry
    />
  );
}
