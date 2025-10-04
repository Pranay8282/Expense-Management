import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import toast from 'react-hot-toast';
import AuthContext from '../../context/AuthContext';
import { createWorker } from 'tesseract.js';

const ExpenseForm = ({ onExpenseAdded }) => {
  const { register, handleSubmit, setValue, reset } = useForm();
  const { user } = useContext(AuthContext);
  const [receiptFile, setReceiptFile] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);

  const handleFileChange = (e) => {
    setReceiptFile(e.target.files[0]);
  };

  const handleOcr = async () => {
    if (!receiptFile) {
      toast.error("Please select a receipt image first.");
      return;
    }
    setOcrLoading(true);
    toast.loading("Scanning receipt...");

    const worker = await createWorker();
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(receiptFile);
    await worker.terminate();
    
    toast.dismiss();
    setOcrLoading(false);
    toast.success("OCR complete. Please verify the data.");

    // Naive data extraction - can be improved with regex
    const amountMatch = text.match(/(\d+\.\d{2})/);
    if (amountMatch) setValue('amount', amountMatch[0]);
    
    setValue('description', text.split('\n')[0] || 'Scanned from receipt');
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => formData.append(key, data[key]));
    if (receiptFile) {
      formData.append('receipt_image', receiptFile);
    }
    // TODO: Implement currency conversion logic
    formData.append('converted_amount', data.amount);
    formData.append('currency', user.company.currency);

    try {
      await api.post('/expenses/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Expense submitted successfully!');
      reset();
      onExpenseAdded();
    } catch (error) {
      toast.error('Failed to submit expense.');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-xl font-bold mb-4">New Expense Claim</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700">Receipt</label>
        <div className="mt-1 flex items-center space-x-4">
            <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"/>
            <button type="button" onClick={handleOcr} disabled={ocrLoading} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400">
                {ocrLoading ? 'Scanning...' : 'Scan with OCR'}
            </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Amount</label>
        <input {...register('amount', { required: true })} type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <input {...register('category', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea {...register('description', { required: true })} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input {...register('date', { required: true })} type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div className="flex justify-end">
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Submit</button>
      </div>
    </form>
  );
};

export default ExpenseForm;
