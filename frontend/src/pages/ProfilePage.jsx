import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Save, Loader2, Calendar } from 'lucide-react';
import client from '../api/client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ProfilePage = () => {
    const { toast } = useToast();
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: '',
        created_at: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
                window.location.href = '/';
                return;
            }
            const user = JSON.parse(storedUser);
            try {
                const response = await client.get(`/users/${user.id}`);
                setUserData(response.data);
            } catch (error) {
                console.error('Failed to fetch profile', error);
                toast({
                    title: "Error",
                    description: "Could not load profile details.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await client.patch(`/users/${userData.id}`, {
                name: userData.name,
                email: userData.email,
                phone: userData.phone
            });

            // Update local storage
            const storedUser = JSON.parse(localStorage.getItem('user'));
            localStorage.setItem('user', JSON.stringify({ ...storedUser, name: userData.name, email: userData.email }));

            toast({
                title: "Success",
                description: "Profile updated successfully!",
            });
        } catch (error) {
            console.error('Update failed', error);
            toast({
                title: "Update Failed",
                description: error.response?.data?.detail || "Could not update profile.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <div className="flex-grow container mx-auto max-w-2xl py-12 px-6">
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-amber-100 p-4 rounded-full">
                            <User className="h-8 w-8 text-amber-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
                            <p className="text-slate-500">Manage your profile and contact information</p>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Legal Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input
                                        id="name"
                                        value={userData.name}
                                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                        className="pl-10"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={userData.email}
                                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                        className="pl-10"
                                        placeholder="name@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={userData.phone || ''}
                                        onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                                        className="pl-10"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Calendar className="h-4 w-4" />
                                    <span>Member since {new Date(userData.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-900 py-6 text-lg"
                        >
                            {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                            Save Changes
                        </Button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ProfilePage;
