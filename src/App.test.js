import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import App from './App';
it('provides section targets, contact, and all role resumes', () => {
  const { container, getByText } = render(<App />);
  container.querySelectorAll('a[href^="#"]').forEach(link => {
    expect(container.querySelector(link.getAttribute('href'))).toBeTruthy();
  });
  expect(getByText('GitHub ↗').getAttribute('href')).toBe('https://github.com/Mohammadjafariyan');
  expect(container.querySelectorAll('.resume-list a[download]').length).toBe(7);
  expect(container.querySelector('.email').getAttribute('href')).toBe('mailto:Mohammad.jafariyan7@gmail.com');
});
it('opens the mobile navigation and closes it after selecting a section', () => {
  const { container, getByText } = render(<App />);
  const toggle = container.querySelector('.menu-toggle');
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  fireEvent.click(toggle);
  expect(toggle.getAttribute('aria-expanded')).toBe('true');
  expect(container.querySelector('#main-navigation').className).toBe('is-open');
  fireEvent.click(getByText('Selected work'));
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
});
