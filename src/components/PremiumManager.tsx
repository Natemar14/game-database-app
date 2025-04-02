import React, { useState, useEffect } from 'react';

// This component implements premium subscription management
// for the game database app

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  features: string[];
  price: number;
  interval: 'monthly' | 'yearly';
  stripePriceId: string;
}

interface SubscriptionStats {
  activeSubscribers: number;
  monthlyRevenue: number;
  conversionRate: number;
  churnRate: number;
}

const PremiumManager = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [stats, setStats] = useState<SubscriptionStats>({
    activeSubscribers: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    churnRate: 0
  });
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Fetch subscription plans and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, these would be API calls
        const plansResponse = await fetch('/api/monetization/subscriptions/plans');
        const plansData = await plansResponse.json();
        
        if (!plansData.success) {
          setError(plansData.error || 'Failed to load subscription plans');
          return;
        }
        
        setPlans(plansData.data);
        
        const statsResponse = await fetch('/api/monetization/subscriptions/stats');
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
          setStats(statsData.data);
        }
      } catch (err) {
        setError('Error loading subscription data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Initialize with default plans if none exist
  useEffect(() => {
    if (!loading && plans.length === 0) {
      setPlans([
        {
          id: crypto.randomUUID(),
          name: 'Premium Monthly',
          description: 'Access all premium features with a monthly subscription',
          features: [
            'Ad-free experience',
            'Unlimited game saves',
            'Advanced scoresheet templates',
            'Tournament creation',
            'Priority support'
          ],
          price: 4.99,
          interval: 'monthly',
          stripePriceId: 'price_1234567890'
        },
        {
          id: crypto.randomUUID(),
          name: 'Premium Yearly',
          description: 'Save 20% with an annual subscription',
          features: [
            'Ad-free experience',
            'Unlimited game saves',
            'Advanced scoresheet templates',
            'Tournament creation',
            'Priority support',
            'Exclusive yearly subscriber benefits'
          ],
          price: 47.99,
          interval: 'yearly',
          stripePriceId: 'price_0987654321'
        }
      ]);
    }
  }, [loading, plans]);
  
  // Save subscription plan
  const savePlan = async () => {
    if (!editingPlan) return;
    
    // Validate inputs
    if (!editingPlan.name.trim()) {
      setError('Plan name is required');
      return;
    }
    
    if (!editingPlan.stripePriceId.trim()) {
      setError('Stripe Price ID is required');
      return;
    }
    
    if (editingPlan.price <= 0) {
      setError('Price must be greater than zero');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      // In a real implementation, this would be an API call
      const response = await fetch('/api/monetization/subscriptions/plans', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingPlan),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to save subscription plan');
        return;
      }
      
      // Update plans list
      setPlans(plans.map(plan => 
        plan.id === editingPlan.id ? editingPlan : plan
      ));
      
      // Clear editing state
      setEditingPlan(null);
    } catch (err) {
      setError('Error saving subscription plan');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Add new feature to plan
  const addFeature = () => {
    if (!editingPlan) return;
    
    setEditingPlan({
      ...editingPlan,
      features: [...editingPlan.features, '']
    });
  };
  
  // Update feature text
  const updateFeature = (index: number, text: string) => {
    if (!editingPlan) return;
    
    const newFeatures = [...editingPlan.features];
    newFeatures[index] = text;
    
    setEditingPlan({
      ...editingPlan,
      features: newFeatures
    });
  };
  
  // Remove feature
  const removeFeature = (index: number) => {
    if (!editingPlan) return;
    
    const newFeatures = [...editingPlan.features];
    newFeatures.splice(index, 1);
    
    setEditingPlan({
      ...editingPlan,
      features: newFeatures
    });
  };
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingPlan) return;
    
    const { name, value } = e.target;
    
    setEditingPlan({
      ...editingPlan,
      [name]: name === 'price' ? parseFloat(value) : value
    });
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading subscription data...</div>;
  }
  
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Premium Subscription Manager</h2>
          <p className="mt-2 text-gray-600">
            Configure and manage premium subscription plans
          </p>
        </div>
        
        {!editingPlan && (
          <button
            onClick={() => setEditingPlan({
              id: crypto.randomUUID(),
              name: 'New Plan',
              description: '',
              features: [''],
              price: 9.99,
              interval: 'monthly',
              stripePriceId: ''
            })}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add New Plan
          </button>
        )}
      </div>
      
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">Active Subscribers</h3>
          <p className="text-3xl font-bold text-indigo-600">{stats.activeSubscribers}</p>
          <p className="text-sm text-gray-500">Total paying users</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">Monthly Revenue</h3>
          <p className="text-3xl font-bold text-indigo-600">${stats.monthlyRevenue.toFixed(2)}</p>
          <p className="text-sm text-gray-500">Recurring revenue</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">Conversion Rate</h3>
          <p className="text-3xl font-bold text-indigo-600">{stats.conversionRate}%</p>
          <p className="text-sm text-gray-500">Free to paid conversion</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">Churn Rate</h3>
          <p className="text-3xl font-bold text-indigo-600">{stats.churnRate}%</p>
          <p className="text-sm text-gray-500">Monthly cancellation rate</p>
        </div>
      </div>
      
      {editingPlan ? (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingPlan.id ? 'Edit' : 'Create'} Subscription Plan
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Plan Name</label>
              <input
                type="text"
                name="name"
                value={editingPlan.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={editingPlan.description}
                onChange={handleInputChange}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    value={editingPlan.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Billing Interval</label>
                <select
                  name="interval"
                  value={editingPlan.interval}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Stripe Price ID</label>
              <input
                type="text"
                name="stripePriceId"
                value={editingPlan.stripePriceId}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Create this price in your Stripe dashboard and paste the ID here
              </p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Features</label>
                <button
                  type="button"
                  onClick={addFeature}
                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Feature
                </button>
              </div>
              
              {editingPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Feature description"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={savePlan}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {saving ? 'Saving...' : 'Save Plan'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Plans</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map(plan => (
              <div key={plan.id} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-4 py-5 border-b border-gray-200 sm:px-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{plan.name}</h3>
                    <button
                      onClick={() => setEditingPlan(plan)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">{plan.description}</p>
                </div>
                
                <div className="px-4 py-5 sm:p-6">
                  <div className="text-3xl font-bold text-gray-900 mb-4">
                    ${plan.price.toFixed(2)}
                    <span className="text-sm font-normal text-gray-500">/{plan.interval}</span>
                  </div>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg classNa
(Content truncated due to size limit. Use line ranges to read in chunks)