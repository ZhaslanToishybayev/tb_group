'use client';

import React from 'react';

type CaptchaGateProps = {
  onToken: (token: string) => void;
  children: React.ReactNode;
};

export function CaptchaGate({ onToken, children }: CaptchaGateProps) {
  const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const handleExecute = async () => {
    // For now, just call onToken with a placeholder
    // TODO: Implement proper reCAPTCHA integration
    if (RECAPTCHA_SITE_KEY) {
      try {
        // Load reCAPTCHA script if not already loaded
        if (typeof window !== 'undefined' && !(window as any).grecaptcha) {
          const script = document.createElement('script');
          script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
          script.async = true;
          document.head.appendChild(script);
          
          // Wait for script to load
          script.onload = () => {
            executeRecaptcha();
          };
        } else {
          executeRecaptcha();
        }
      } catch (error) {
        console.error('reCAPTCHA execution failed:', error);
        // Fallback: proceed without token
        onToken('fallback-token');
      }
    } else {
      // No reCAPTCHA configured, proceed without token
      onToken('no-recaptcha-token');
    }
  };

  const executeRecaptcha = () => {
    if (typeof window !== 'undefined' && (window as any).grecaptcha) {
      (window as any).grecaptcha.ready(() => {
        (window as any).grecaptcha
          .execute(RECAPTCHA_SITE_KEY, { action: 'contact_form' })
          .then((token: string) => {
            onToken(token);
          })
          .catch((error: any) => {
            console.error('reCAPTCHA execution failed:', error);
            onToken('fallback-token');
          });
      });
    } else {
      onToken('no-recaptcha-token');
    }
  };

  return (
    <div>
      {children}
      <button
        type="button"
        onClick={handleExecute}
        className="hidden"
        aria-hidden="true"
        data-testid="recaptcha-trigger"
      >
        Execute reCAPTCHA
      </button>
    </div>
  );
}