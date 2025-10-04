import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import toast from 'react-hot-toast';

const UserForm = ({ user, onSuccess }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [managers, setManagers] = useState([]);
    const isEditing = !!user;
    const formInputClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm";

    useEffect(() => {
        api.get('/users/manage/')
            .then(res => {
                const potentialManagers = res.data.filter(u => u.role === 'MANAGER' || u.role === 'ADMIN');
                setManagers(potentialManagers);
            })
            .catch(err => console.error("Failed to fetch managers", err));
    }, []);

    useEffect(() => {
        if (user && managers.length > 0) {
            const managerObj = managers.find(m => m.username === user.manager);
            reset({ ...user, manager: managerObj ? managerObj.id : "" });
        } else if (!user) {
            reset({});
        }
    }, [user, reset, managers]);

    const onSubmit = async (data) => {
        const payload = { ...data };
        if (payload.manager === "") {
            payload.manager = null;
        }

        try {
            if (isEditing) {
                if (!payload.password) {
                    delete payload.password;
                }
                await api.patch(`/users/manage/${user.id}/`, payload);
                toast.success('User updated successfully!');
            } else {
                await api.post('/users/manage/', payload);
                toast.success('User created successfully!');
            }
            onSuccess();
        } catch (error) {
            toast.error('An error occurred. Check console for details.');
            console.error(error.response?.data || error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h3 className="text-xl font-bold mb-4">{isEditing ? 'Edit User' : 'Create User'}</h3>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input {...register('username', { required: 'Username is required' })} className={formInputClass} disabled={isEditing} />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input {...register('email', { required: 'Email is required' })} type="email" className={formInputClass} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input {...register('password', { required: !isEditing })} type="password" placeholder={isEditing ? "Leave blank to keep current" : ""} className={formInputClass} />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input {...register('first_name')} className={formInputClass} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input {...register('last_name')} className={formInputClass} />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select {...register('role', { required: true })} className={formInputClass}>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Manager</label>
                <select {...register('manager')} className={formInputClass}>
                    <option value="">None</option>
                    {managers.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name} ({m.username})</option>)}
                </select>
            </div>

            <div className="flex items-center">
                <input {...register('is_manager_approver')} type="checkbox" className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                <label className="ml-2 block text-sm text-gray-900">Is Manager an Approver?</label>
            </div>

            <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    {isEditing ? 'Save Changes' : 'Create User'}
                </button>
            </div>
        </form>
    );
};

export default UserForm;
