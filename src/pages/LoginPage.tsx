import React from 'react';
import Button from '../components/Button'; 
type LoginProps = {
  handleLogin: () => void;
};

export default function LoginPage({ handleLogin }: LoginProps) {
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center p-4 text-slate-800">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-rose-500 rounded-full mb-6 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
            </svg>
          </div>
          <div className="text-center w-full">
            <h1 className="text-3xl font-bold mb-2">Log in or sign up</h1>
            <p className="text-slate-500 mb-8">to continue to our app</p>
            <Button onClick={handleLogin}>
              <span>Continue with Google</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

