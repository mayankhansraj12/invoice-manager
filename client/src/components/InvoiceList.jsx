import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import * as api from '../services/api';

const CountUp = ({ end, duration = 2000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime;
        let animationFrame;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);

            // Ease out quart
            const ease = 1 - Math.pow(1 - percentage, 4);

            setCount(Math.floor(end * ease));

            if (progress < duration) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);

    return <span>{count.toLocaleString()}</span>;
};

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const data = await api.getInvoices();
                setInvoices(data);
            } catch (err) {
                setError('Failed to load invoices');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []);

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    if (error) return <div className="text-center text-red-600 mt-10">{error}</div>;

    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const totalPending = totalAmount - totalPaid;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Hero/Header Section */}
            <header className="bg-slate-900 text-white shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-slate-900 opacity-90"></div>
                <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
                            Dashboard
                        </h1>
                        <p className="text-lg text-blue-200 max-w-2xl">
                            Overview of your financial performance and recent invoicing activity.
                        </p>
                    </div>
                    {/* Decorative element could go here */}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-12 relative z-20">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-10">
                    <div className="bg-white overflow-hidden shadow-lg rounded-xl border-l-4 border-blue-600 transform hover:-translate-y-1 transition duration-300">
                        <div className="px-6 py-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</p>
                                    <p className="mt-2 text-3xl font-bold text-gray-900">
                                        ₹<CountUp end={totalAmount} />
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-full">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow-lg rounded-xl border-l-4 border-green-500 transform hover:-translate-y-1 transition duration-300">
                        <div className="px-6 py-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Collected</p>
                                    <p className="mt-2 text-3xl font-bold text-green-600">
                                        ₹<CountUp end={totalPaid} />
                                    </p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-full">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow-lg rounded-xl border-l-4 border-red-500 transform hover:-translate-y-1 transition duration-300">
                        <div className="px-6 py-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Pending</p>
                                    <p className="mt-2 text-3xl font-bold text-red-600">
                                        ₹<CountUp end={totalPending} />
                                    </p>
                                </div>
                                <div className="p-3 bg-red-50 rounded-full">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoices List */}
                <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
                    <div className="px-6 py-5 border-b border-gray-100 bg-white flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Start Invoicing</h2>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {invoices.length} Total
                        </span>
                    </div>
                    <ul className="divide-y divide-gray-100">
                        {invoices.length === 0 ? (
                            <li className="px-6 py-12 text-center text-gray-500 bg-gray-50">
                                <div className="flex flex-col items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    <p className="text-lg font-medium text-gray-600">No invoices found</p>
                                    <p className="text-gray-400 text-sm">Create your first invoice to get started.</p>
                                </div>
                            </li>
                        ) : (
                            invoices.map((invoice, index) => (
                                <li key={invoice._id} className="group hover:bg-blue-50 transition duration-200 ease-in-out">
                                    <Link to={`/invoices/${invoice.invoiceNumber}`} className="block">
                                        <div className="px-6 py-5 sm:flex items-center justify-between">
                                            <div className="flex items-center mb-4 sm:mb-0">
                                                <div className="flex-shrink-0">
                                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm
                                                        ${invoice.status === 'PAID' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                                                            invoice.status === 'OVERDUE' ? 'bg-gradient-to-br from-red-400 to-red-600' :
                                                                invoice.status === 'DRAFT' ? 'bg-gradient-to-br from-gray-400 to-gray-600' : 'bg-gradient-to-br from-yellow-400 to-yellow-600'}`}>
                                                        {invoice.customerName.charAt(0)}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-blue-600 truncate group-hover:text-blue-800 transition-colors">
                                                        {invoice.invoiceNumber}
                                                    </div>
                                                    <div className="text-base font-semibold text-gray-900">
                                                        {invoice.customerName}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end sm:space-x-12 w-full sm:w-auto">
                                                <div className="text-left sm:text-right">
                                                    <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Due Date</div>
                                                    <div className="text-sm font-medium text-gray-700">
                                                        {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                                                    </div>
                                                </div>
                                                <div className="text-right min-w-[120px]">
                                                    <div className="text-lg font-bold text-gray-900 group-hover:scale-105 transition-transform origin-right">
                                                        ₹{invoice.total.toLocaleString()}
                                                    </div>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                                                        ${invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                                            invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                                                                invoice.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {invoice.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div className="hidden sm:block text-gray-300 group-hover:text-blue-500 transition-colors group-hover:translate-x-1 duration-200">
                                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </main>
        </div>
    );
};

export default InvoiceList;
