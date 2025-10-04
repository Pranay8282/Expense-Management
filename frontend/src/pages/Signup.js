import React, { useContext, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const Signup = () => {
  const { register, handleSubmit, watch } = useForm();
  const { signupUser } = useContext(AuthContext);
  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  const selectedCountry = watch('country');

  useEffect(() => {
    axios.get('https://restcountries.com/v3.1/all?fields=name,currencies')
      .then(res => {
        const countryData = res.data.map(c => ({
          name: c.name.common,
          currency: Object.keys(c.currencies)[0]
        })).sort((a, b) => a.name.localeCompare(b.name));
        setCountries(countryData);
      })
      .catch(err => console.error("Failed to fetch countries", err));
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const country = countries.find(c => c.name === selectedCountry);
      if (country) {
        setCurrencies([country.currency]);
      }
    } else {
      setCurrencies([]);
    }
  }, [selectedCountry, countries]);

  const onSubmit = (data) => {
    signupUser(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create a new account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            <input {...register('company_name', { required: true })} placeholder="Company Name" className="input-field" />
            <select {...register('country', { required: true })} className="input-field">
              <option value="">Select Country</option>
              {countries.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <select {...register('currency', { required: true })} className="input-field" disabled={!selectedCountry}>
              <option value="">Select Currency</option>
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <hr/>
            <input {...register('first_name', { required: true })} placeholder="First Name" className="input-field" />
            <input {...register('last_name', { required: true })} placeholder="Last Name" className="input-field" />
            <input {...register('username', { required: true })} placeholder="Username" className="input-field" />
            <input {...register('email', { required: true })} type="email" placeholder="Email" className="input-field" />
            <input {...register('password', { required: true })} type="password" placeholder="Password" className="input-field" />
          </div>

          <div>
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Sign up
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
