import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Trash2, Edit3, Check, X, AlertCircle, Filter, Search } from 'lucide-react';

const MIC3X2XFilterManager = () => {
  const [filters, setFilters] = useState({
    pass: [],
    block: [],
    flowControl: [],
    flowControlPairs: []
  });
  
  const [activeTab, setActiveTab] = useState('pass');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newFilter, setNewFilter] = useState({
    pattern: '',
    mask: '',
    description: '',
    type: '11bit'
  });

  // Maximum filters based on MIC3X2X specifications
  const MAX_FILTERS = {
    pass: 208,      // CAN: 208, non-CAN: 3
    block: 208,     // CAN: 208, non-CAN: 3  
    flowControl: 208, // CAN only
    flowControlPairs: 208
  };

  const FILTER_TYPES = [
    { value: '11bit', label: '11-bit CAN ID (hhh)', example: '7DF' },
    { value: '29bit', label: '29-bit CAN ID (hhhhhhhh)', example: '18DA10F1' },
    { value: '11bit_ext', label: '11-bit + Ext Addr (hhh-hh)', example: '7DF-F1' },
    { value: '29bit_ext', label: '29-bit + Ext Addr (hhhhhhhh-hh)', example: '18DA10F1-20' },
    { value: 'non_can', label: 'Non-CAN format (hhhhhh)', example: '416B10' }
  ];

  const validatePattern = (pattern, type) => {
    const patterns = {
      '11bit': /^[0-9A-Fa-f]{3}$/,
      '29bit': /^[0-9A-Fa-f]{8}$/,
      '11bit_ext': /^[0-9A-Fa-f]{3}-[0-9A-Fa-f]{2}$/,
      '29bit_ext': /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{2}$/,
      'non_can': /^[0-9A-Fa-f]{6}$/
    };
    return patterns[type]?.test(pattern) || false;
  };

  const validateMask = (mask, type) => {
    // Mask should match the same format as pattern
    return validatePattern(mask, type);
  };

  const addFilter = () => {
    if (!validatePattern(newFilter.pattern, newFilter.type)) {
      alert('Invalid pattern format for selected type');
      return;
    }
    
    if (newFilter.mask && !validateMask(newFilter.mask, newFilter.type)) {
      alert('Invalid mask format for selected type');
      return;
    }

    if (filters[activeTab].length >= MAX_FILTERS[activeTab]) {
      alert(`Maximum ${MAX_FILTERS[activeTab]} filters reached for ${activeTab} filters`);
      return;
    }

    const filter = {
      id: Date.now(),
      ...newFilter,
      mask: newFilter.mask || getDefaultMask(newFilter.type),
      timestamp: new Date().toISOString()
    };

    setFilters(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], filter]
    }));

    setNewFilter({ pattern: '', mask: '', description: '', type: '11bit' });
    setShowAddForm(false);
  };

  const getDefaultMask = (type) => {
    const masks = {
      '11bit': '7FF',
      '29bit': '1FFFFFFF',
      '11bit_ext': '7FF-FF',
      '29bit_ext': '1FFFFFFF-FF',
      'non_can': 'FFFFFF'
    };
    return masks[type] || 'FFF';
  };

  const deleteFilter = (id) => {
    setFilters(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(filter => filter.id !== id)
    }));
  };

  const updateFilter = (id, updates) => {
    setFilters(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(filter =>
        filter.id === id ? { ...filter, ...updates } : filter
      )
    }));
    setEditingId(null);
  };

  const clearAllFilters = () => {
    if (window.confirm(`Clear all ${activeTab} filters?`)) {
      setFilters(prev => ({
        ...prev,
        [activeTab]: []
      }));
    }
  };

  const generateVTCommand = (filter) => {
    const commands = {
      pass: `VT FPA ${filter.pattern}, ${filter.mask}`,
      block: `VT FBA ${filter.pattern}, ${filter.mask}`,
      flowControl: `VT FCPA ${filter.pattern}, ${filter.mask}`,
      flowControlPairs: `VT FCTRA ${filter.pattern}, ${filter.mask}`
    };
    return commands[activeTab];
  };

  const generateATCommand = (filter) => {
    if (activeTab === 'pass' || activeTab === 'block') {
      // AT commands use CF/CM for basic filtering
      return `AT CF ${filter.pattern}\nAT CM ${filter.mask}`;
    }
    return 'N/A for AT commands';
  };

  const filteredFilters = filters[activeTab].filter(filter =>
    filter.pattern.toLowerCase().includes(searchTerm.toLowerCase()) ||
    filter.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const TabButton = ({ tab, label, count }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === tab
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {label} ({count})
    </button>
  );

  const FilterCard = ({ filter }) => {
    const [editData, setEditData] = useState(filter);
    const isEditing = editingId === filter.id;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editData.pattern}
                  onChange={(e) => setEditData({...editData, pattern: e.target.value.toUpperCase()})}
                  className="w-full p-2 border rounded text-sm"
                  placeholder="Pattern"
                />
                <input
                  type="text"
                  value={editData.mask}
                  onChange={(e) => setEditData({...editData, mask: e.target.value.toUpperCase()})}
                  className="w-full p-2 border rounded text-sm"
                  placeholder="Mask"
                />
                <input
                  type="text"
                  value={editData.description}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  className="w-full p-2 border rounded text-sm"
                  placeholder="Description"
                />
                <select
                  value={editData.type}
                  onChange={(e) => setEditData({...editData, type: e.target.value})}
                  className="w-full p-2 border rounded text-sm"
                >
                  {FILTER_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <div className="font-mono text-lg">
                  <span className="text-blue-600">{filter.pattern}</span>
                  {filter.mask && (
                    <span className="text-gray-500"> / {filter.mask}</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">{filter.description}</div>
                <div className="text-xs text-gray-400">
                  {FILTER_TYPES.find(t => t.value === filter.type)?.label}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex space-x-1 ml-4">
            {isEditing ? (
              <>
                <button
                  onClick={() => updateFilter(filter.id, editData)}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditingId(filter.id)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => deleteFilter(filter.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>
        
        {!isEditing && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
            <div className="font-semibold mb-1">VT Command:</div>
            <code className="text-blue-600">{generateVTCommand(filter)}</code>
            <div className="font-semibold mt-2 mb-1">AT Command:</div>
            <code className="text-green-600">{generateATCommand(filter)}</code>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Filter className="text-blue-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-800">MIC3X2X Filter Manager</h1>
          <div className="text-sm text-gray-500">
            208 Filters Max (CAN) / 3 Filters Max (Non-CAN)
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6">
          <TabButton tab="pass" label="Pass Filters" count={filters.pass.length} />
          <TabButton tab="block" label="Block Filters" count={filters.block.length} />
          <TabButton tab="flowControl" label="Flow Control" count={filters.flowControl.length} />
          <TabButton tab="flowControlPairs" label="FC Pairs" count={filters.flowControlPairs.length} />
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              <Plus size={16} />
              <span>Add Filter</span>
            </button>
            
            <button
              onClick={clearAllFilters}
              className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              disabled={filters[activeTab].length === 0}
            >
              <Trash2 size={16} />
              <span>Clear All</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search filters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border rounded-lg w-64"
            />
          </div>
        </div>

        {/* Filter Limit Warning */}
        {filters[activeTab].length >= MAX_FILTERS[activeTab] * 0.9 && (
          <div className="flex items-center space-x-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 mb-4">
            <AlertCircle className="text-yellow-600" size={16} />
            <span className="text-yellow-700">
              Approaching limit: {filters[activeTab].length}/{MAX_FILTERS[activeTab]} filters
            </span>
          </div>
        )}

        {/* Add Filter Form */}
        {showAddForm && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-3">Add New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Filter</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={newFilter.type}
                  onChange={(e) => setNewFilter({...newFilter, type: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  {FILTER_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  Ex: {FILTER_TYPES.find(t => t.value === newFilter.type)?.example}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Pattern</label>
                <input
                  type="text"
                  value={newFilter.pattern}
                  onChange={(e) => setNewFilter({...newFilter, pattern: e.target.value.toUpperCase()})}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., 7DF"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Mask (optional)</label>
                <input
                  type="text"
                  value={newFilter.mask}
                  onChange={(e) => setNewFilter({...newFilter, mask: e.target.value.toUpperCase()})}
                  className="w-full p-2 border rounded"
                  placeholder={`Default: ${getDefaultMask(newFilter.type)}`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={newFilter.description}
                  onChange={(e) => setNewFilter({...newFilter, description: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="Optional description"
                />
              </div>
            </div>
            
            <div className="flex space-x-2 mt-4">
              <button
                onClick={addFilter}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add Filter
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filters List */}
        <div className="space-y-3">
          {filteredFilters.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Filter size={48} className="mx-auto mb-4 opacity-50" />
              <p>No {activeTab} filters configured</p>
              <p className="text-sm">Add a filter to get started</p>
            </div>
          ) : (
            filteredFilters.map(filter => (
              <FilterCard key={filter.id} filter={filter} />
            ))
          )}
        </div>

        {/* Command Examples */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-3">MIC3X2X Filter Commands</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-600 mb-2">VT Commands:</div>
              <div className="space-y-1 font-mono text-xs">
                <div>VT FPA pattern, mask    # Add pass filter</div>
                <div>VT FPA                  # Clear all pass filters</div>
                <div>VT FBA pattern, mask    # Add block filter</div>
                <div>VT FBA                  # Clear all block filters</div>
                <div>VT FCPA pattern, mask   # Add FC filter</div>
                <div>VT FCTRA tx, rx        # Add FC pair</div>
              </div>
            </div>
            <div>
              <div className="font-medium text-green-600 mb-2">Supported Formats:</div>
              <div className="space-y-1 text-xs">
                <div>• 11-bit CAN: hhh (e.g., 7DF)</div>
                <div>• 29-bit CAN: hhhhhhhh (e.g., 18DA10F1)</div>
                <div>• 11-bit + Ext: hhh-hh (e.g., 7DF-F1)</div>
                <div>• 29-bit + Ext: hhhhhhhh-hh</div>
                <div>• Non-CAN: hhhhhh (e.g., 416B10)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MIC3X2XFilterManager;