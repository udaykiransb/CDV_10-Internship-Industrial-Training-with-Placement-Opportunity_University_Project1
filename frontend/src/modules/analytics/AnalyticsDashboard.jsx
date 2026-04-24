import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../../api/api';

const AnalyticsDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('monthly'); // 'monthly' or 'semester'

    const COLORS = ['#002b5b', '#607d8b', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

    useEffect(() => {
        const fetchRichAnalytics = async () => {
            try {
                const res = await api.get('/analytics/rich');
                setData(res.data.data);
            } catch (err) {
                console.error('Failed to fetch rich analytics:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRichAnalytics();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="loader">Aggregating Institutional Data Models...</div>
        </div>
    );

    if (!data) return <div className="alert alert-error">No analytics data available at this time.</div>;

    const trendData = viewMode === 'monthly' ? data.monthly : data.semester;

    return (
        <div className="page-container" style={{ padding: '2rem', maxWidth: '1450px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: '1000', color: 'var(--primary)', marginBottom: '0.5rem', letterSpacing: '-1px' }}>
                        INSTITUTIONAL PERFORMANCE INTELLIGENCE
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Real-time Analytics Engine • Model-Driven Success Benchmarking
                    </p>
                </div>
                <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
                    <button 
                        onClick={() => setViewMode('monthly')}
                        style={{ 
                            padding: '8px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: '800', transition: 'all 0.3s ease',
                            background: viewMode === 'monthly' ? 'white' : 'transparent',
                            color: viewMode === 'monthly' ? 'var(--primary)' : 'var(--text-muted)',
                            boxShadow: viewMode === 'monthly' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                        }}
                    >MONTHLY TRENDS</button>
                    <button 
                        onClick={() => setViewMode('semester')}
                        style={{ 
                            padding: '8px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: '800', transition: 'all 0.3s ease',
                            background: viewMode === 'semester' ? 'white' : 'transparent',
                            color: viewMode === 'semester' ? 'var(--primary)' : 'var(--text-muted)',
                            boxShadow: viewMode === 'semester' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                        }}
                    >SEMESTER ENGINE</button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                {/* 1. Main Trend Chart */}
                <div className="linways-card" style={{ padding: '1.5rem' }}>
                    <div className="linways-card-header" style={{ marginBottom: '2rem' }}>
                        <h4>PLACEMENT & APPLICATION VELOCITY</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Historical volume analysis via {viewMode} aggregations</p>
                    </div>
                    <div style={{ height: '350px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#002b5b" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#002b5b" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorPlacements" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" fontSize={11} fontWeight={700} axisLine={false} tickLine={false} />
                                <YAxis fontSize={11} fontWeight={700} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: '700' }}
                                />
                                <Area type="monotone" dataKey="applications" stroke="#002b5b" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                                <Area type="monotone" dataKey="placements" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPlacements)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Pipeline Snapshot */}
                <div className="linways-card" style={{ padding: '1.5rem' }}>
                    <div className="linways-card-header" style={{ marginBottom: '2rem' }}>
                        <h4>PIPELINE DISTRIBUTION</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current functional status of all records</p>
                    </div>
                    <div style={{ height: '350px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.pipeline}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.pipeline.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: '700' }}
                                />
                                <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '800' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. Departmental Success Rates */}
            <div className="linways-card" style={{ padding: '1.5rem' }}>
                <div className="linways-card-header" style={{ marginBottom: '2.5rem' }}>
                    <h4>DEPARTMENTAL SUCCESS BENCHMARKING</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Comparison of recruitment efficiency across academic branches</p>
                </div>
                <div style={{ height: '400px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.departmental} layout="vertical" margin={{ left: 50, right: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="department" type="category" fontSize={12} width={150} fontWeight={900} axisLine={false} tickLine={false} />
                            <Tooltip 
                                 cursor={{ fill: '#f8fafc' }}
                                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: '700' }}
                                 formatter={(val) => [`${val.toFixed(1)}% Success Rate`, 'Performance']}
                            />
                            <Bar dataKey="successRate" radius={[0, 10, 10, 0]} barSize={25}>
                                {data.departmental.map((entry, index) => (
                                    <Cell key={`cell-dept-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
