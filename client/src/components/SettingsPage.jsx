import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { updateSettings } from '../store/settingsSlice';

export default function SettingsPage({
    settings = {
        proxyIps: [],
        aiModel: 'gemini',
        customModel: '',
        openaiKey: '',
        geminiKey: '',
        huggingfaceKey: ''
    },
    onSave = (newSettings) => {
        console.log('Settings saved:', newSettings);
    }
}) {
    const dispatch = useDispatch();
    const [saveStatus, setSaveStatus] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const newSettings = {
                proxyIps: formData.get('proxyIps').split('\n').filter(ip => ip.trim()),
                aiModel: formData.get('aiModel'),
                customModel: formData.get('customModel'),
                openaiKey: formData.get('openaiKey'),
                geminiKey: formData.get('geminiKey'),
                huggingfaceKey: formData.get('huggingfaceKey'),
            };
            onSave(newSettings);
            dispatch(updateSettings(newSettings));
            setSaveStatus('Settings saved successfully!');
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {
            setSaveStatus('Error saving settings');
            console.error('Settings save error:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {saveStatus && (
                <div className={`mb-4 p-4 rounded ${saveStatus.includes('Error') ? 'bg-red-500' : 'bg-green-500'}`}>
                    {saveStatus}
                </div>
            )}
            <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg">
                <div className="p-4 border-b border-gray-700">
                    <h2 className="text-xl font-semibold">Settings</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Proxy IPs */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Proxy IP Addresses
                            <span className="text-gray-400 text-xs ml-2">(One per line)</span>
                        </label>
                        <textarea
                            name="proxyIps"
                            rows="3"
                            defaultValue={settings.proxyIps?.join('\n')}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm"
                            placeholder="Enter proxy IP addresses..."
                        />
                    </div>

                    {/* AI Model Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">AI Model</label>
                        <select
                            name="aiModel"
                            defaultValue={settings.aiModel}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2"
                        >
                            <option value="gemini">Google Gemini</option>
                            <option value="openai">OpenAI</option>
                            <option value="huggingface">Hugging Face (Custom)</option>
                        </select>
                    </div>

                    {/* Custom Hugging Face Model */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Custom Hugging Face Model
                            <span className="text-gray-400 text-xs ml-2">(e.g., gpt2, facebook/opt-1.3b)</span>
                        </label>
                        <input
                            type="text"
                            name="customModel"
                            defaultValue={settings.customModel}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2"
                            placeholder="Enter model name..."
                        />
                    </div>

                    {/* API Keys */}
                    <div className="space-y-4">
                        <h3 className="font-medium">API Keys</h3>
                        <div>
                            <label className="block text-sm font-medium mb-2">OpenAI API Key</label>
                            <input
                                type="password"
                                name="openaiKey"
                                defaultValue={settings.openaiKey}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2"
                                placeholder="sk-..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Google Gemini API Key</label>
                            <input
                                type="password"
                                name="geminiKey"
                                defaultValue={settings.geminiKey}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Hugging Face API Key</label>
                            <input
                                type="password"
                                name="huggingfaceKey"
                                defaultValue={settings.huggingfaceKey}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-700">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

SettingsPage.propTypes = {
    settings: PropTypes.shape({
        proxyIps: PropTypes.arrayOf(PropTypes.string),
        aiModel: PropTypes.string,
        customModel: PropTypes.string,
        openaiKey: PropTypes.string,
        geminiKey: PropTypes.string,
        huggingfaceKey: PropTypes.string
    }),
    onSave: PropTypes.func.isRequired
};