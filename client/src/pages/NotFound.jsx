import React from 'react';
import ErrorPage from './ErrorPage.jsx';

export default function NotFound() {
  return (
    <ErrorPage
      code="404"
      title="This page doesn't exist"
      message="The link may be broken, or the page may have moved. Try heading back to a page that exists."
    />
  );
}
