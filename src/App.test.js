import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import App from './App';

it('provides section targets, contact, and AI resume', () => {
  const { container, getByText } = render(<App />);
  container.querySelectorAll('a[href^="#"]').forEach(link => {
    expect(container.querySelector(link.getAttribute('href'))).toBeTruthy();
  });
  expect(getByText('GitHub').getAttribute('href')).toBe('https://github.com/Mohammadjafariyan');
  expect(container.querySelector('a[download]').getAttribute('href')).toContain(
    'Mohammad_Jafariyan_Resume_AI_LLM.pdf'
  );
  expect(container.querySelector('.email').getAttribute('href')).toBe(
    'mailto:Mohammad.jafariyan7@gmail.com'
  );
});

it('opens the mobile navigation and closes it after selecting a section', () => {
  const { container, getByText } = render(<App />);
  const toggle = container.querySelector('.menu-toggle');
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  fireEvent.click(toggle);
  expect(toggle.getAttribute('aria-expanded')).toBe('true');
  expect(container.querySelector('#main-navigation').className).toBe('is-open');
  fireEvent.click(getByText('Work'));
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
});

it('switches language and updates document direction for RTL', () => {
  const { getByText } = render(<App />);
  fireEvent.click(getByText('FA'));
  expect(document.documentElement.dir).toBe('rtl');
  expect(document.documentElement.lang).toBe('fa');
  fireEvent.click(getByText('EN'));
  expect(document.documentElement.dir).toBe('ltr');
});
