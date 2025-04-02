import React, { useState, useEffect } from 'react';

// This component implements ad integration for the game database app

interface AdConfig {
  enabled: boolean;
  provider: 'admob' | 'facebook' | 'unity';
  bannerAdUnitId: string;
  interstitialAdUnitId: string;
  rewardedAdUnitId: string;
  testMode: boolean;
}

interface AdStats {
  impressions: number;
  clicks: number;
  revenue: number;
  fillRate: number;
}

const AdManager = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adConfig, setAdConfig] = useState<AdConfig>({
    enabled: true,
    provider: 'admob',
    bannerAdUnitId: 'ca-app-pub-3940256099942544/6300978111', // Test ID
    interstitialAdUnitId: 'ca-app-pub-3940256099942544/1033173712', // Test ID
    rewardedAdUnitId: 'ca-app-pub-3940256099942544/5224354917', // Test ID
    testMode: true
  });
  const [adStats, setAdStats] = useState<AdStats>({
    impressions: 0,
    clicks: 0,
    revenue: 0,
    fillRate: 0
  });
  const [saving, setSaving] = useState(false);
  
  // Fetch ad configuration
  useEffect(() => {
    const fetchAdConfig = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, this would be an API call
        const response = await fetch('/api/monetization/ads/config');
        const data = await response.json();
        
        if (!data.success) {
          setError(data.error || 'Failed to load ad configuration');
          return;
        }
        
        setAdConfig(data.data);
        
        // Fetch ad stats
        const statsResponse = await fetch('/api/monetization/ads/stats');
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
          setAdStats(statsData.data);
        }
      } catch (err) {
        setError('Error loading ad configuration');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdConfig();
  }, []);
  
  // Save ad configuration
  const saveAdConfig = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // In a real implementation, this would be an API call
      const response = await fetch('/api/monetization/ads/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adConfig),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to save ad configuration');
        return;
      }
      
      alert('Ad configuration saved successfully');
    } catch (err) {
      setError('Error saving ad configuration');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setAdConfig({
      ...adConfig,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };
  
  // Get provider documentation link
  const getProviderDocLink = () => {
    switch (adConfig.provider) {
      case 'admob':
        return 'https://developers.google.com/admob/android/quick-start';
      case 'facebook':
        return 'https://developers.facebook.com/docs/audience-network/getting-started';
      case 'unity':
        return 'https://docs.unity.com/ads/IntroductionUnityAdsSDK.html';
      default:
        return '#';
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading ad configuration...</div>;
  }
  
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ad Manager</h2>
          <p className="mt-2 text-gray-600">
            Configure and manage in-app advertisements
          </p>
        </div>
        
        <button
          onClick={saveAdConfig}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
      
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">Impressions</h3>
          <p className="text-3xl font-bold text-indigo-600">{adStats.impressions.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total ad views</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">Clicks</h3>
          <p className="text-3xl font-bold text-indigo-600">{adStats.clicks.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total ad clicks</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">Revenue</h3>
          <p className="text-3xl font-bold text-indigo-600">${adStats.revenue.toFixed(2)}</p>
          <p className="text-sm text-gray-500">Estimated earnings</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">Fill Rate</h3>
          <p className="text-3xl font-bold text-indigo-600">{adStats.fillRate}%</p>
          <p className="text-sm text-gray-500">Ad delivery rate</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ad Configuration</h3>
        
        <div className="space-y-6">
          <div className="flex items-center">
            <input
              id="enabled"
              name="enabled"
              type="checkbox"
              checked={adConfig.enabled}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="enabled" className="ml-2 block text-sm text-gray-900">
              Enable advertisements
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Ad Provider</label>
            <select
              name="provider"
              value={adConfig.provider}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="admob">Google AdMob</option>
              <option value="facebook">Facebook Audience Network</option>
              <option value="unity">Unity Ads</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              <a 
                href={getProviderDocLink()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-500"
              >
                View {adConfig.provider.toUpperCase()} documentation
              </a>
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Banner Ad Unit ID</label>
            <input
              type="text"
              name="bannerAdUnitId"
              value={adConfig.bannerAdUnitId}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Used for banner ads displayed at the bottom of screens
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Interstitial Ad Unit ID</label>
            <input
              type="text"
              name="interstitialAdUnitId"
              value={adConfig.interstitialAdUnitId}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Used for full-screen ads between screen transitions
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Rewarded Ad Unit ID</label>
            <input
              type="text"
              name="rewardedAdUnitId"
              value={adConfig.rewardedAdUnitId}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Used for rewarded ads that provide in-app benefits
            </p>
          </div>
          
          <div className="flex items-center">
            <input
              id="testMode"
              name="testMode"
              type="checkbox"
              checked={adConfig.testMode}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="testMode" className="ml-2 block text-sm text-gray-900">
              Enable test mode (use test ad units)
            </label>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ad Placement Strategy</h3>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-md font-medium text-gray-900 mb-2">Recommended Ad Placements</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>Banner ads:</strong> Display at the bottom of the home screen, game list, and search results</li>
            <li>• <strong>Interstitial ads:</strong> Show after completing a game session or tournament</li>
            <li>• <strong>Rewarded ads:</strong> Offer to users in exchange for premium features or temporary removal of other ads</li>
          </ul>
          
          <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm text-yellow-700">
            <p><strong>Note:</strong> For optimal user experience, limit interstitial ads to no more than once every 3-5 minutes of app usage.</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Implementation Guide</h3>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-md font-medium text-gray-900 mb-2">Integration Steps</h4>
          <ol className="space-y-2 list-decimal list-inside text-sm text-gray-600">
            <li>Register for an account with your chosen ad provider ({adConfig.provider.toUpperCase()})</li>
            <li>Create ad units in the provider dashboard and obtain unit IDs</li>
            <li>Replace the test IDs in this configuration with your actual ad unit IDs</li>
            <li>Set test mode to false when ready to monetize</li>
            <li>Monitor performance in your ad provider dashboard</li>
          </ol>
          
          <div className="mt-4">
            <h4 className="text-md font-medium text-gray-900 mb-2">Code Implementation</h4>
            <pre className="bg-gray-800 text-gray-200 p-3 rounded text-xs overflow-auto">
{`// Example implementation for AdMob banner
import { AdMobBanner } from 'expo-ads-admob';

export default function BannerAdComponent() {
  return (
    <AdMobBanner
      bannerSize="smartBannerPortrait"
      adUnitID="${adConfig.bannerAdUnitId}"
      servePersonalizedAds={true}
      onDidFailToReceiveAdWithError={(error) => console.error(error)}
    />
  );
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdManager;
