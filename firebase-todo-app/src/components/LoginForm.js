import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const auth = getAuth();

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            setEmail('');
            setPassword('');
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setEmail('');
            setPassword('');
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
            {auth.currentUser ? (
                <div className="text-center">
                    <p className="mb-4">Logged in as: {auth.currentUser.email}</p>
                    <button
                        onClick={handleSignOut}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Sign Out
                    </button>
                </div>
            ) : (
                <form className="space-y-4">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>
                    <div className="flex space-x-4">
                        <button
                            onClick={handleSignIn}
                            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={handleSignUp}
                            className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default LoginForm;