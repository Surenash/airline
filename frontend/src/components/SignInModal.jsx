import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import client from '../api/client';

const SignInModal = ({ isOpen, onOpenChange }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        // --- Authentication & Security Enhancements ---
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            toast.error('Invalid email format. Please enter a valid email address.');
            return;
        }

        const trustedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'skylux.com']; // Example trusted list
        const domain = email.split('@')[1].toLowerCase();
        if (!trustedDomains.includes(domain)) {
            toast.error('Email domain is not trusted. Please use a reputable provider.');
            return;
        }
        // ---------------------------------------------

        try {
            const response = await client.post('/users/login', { email, password });
            toast.success(response.data.message || 'Successfully signed in!');
            localStorage.setItem('user', JSON.stringify(response.data));
            window.dispatchEvent(new Event('auth-change'));
            onOpenChange(false);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to sign in. Check your credentials.');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-slate-900">Sign In</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900">
                        Sign In
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SignInModal;
