import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Trash2, Edit3, Check, X, AlertCircle, Zap, Clock, Play, Pause, Copy, Download } from 'lucide-react';

const MIC3X2XWakeupManager = () => {
  const [sequences, setSequences] = useState({
    can: [],
    iso: []
  });
  
  const [activeTab, setActiveTab] = useState('can');
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newSequence, setNewSequence] = useState({
    sequenceNumber: 1,
    protocol: '',
    header: '',
    data: '',
    period: 100,
    mode: 0,
    description: '',
    enabled: true
  });

  // CAN Wake/Hold Modes from datasheet
  const CAN_MODES = [
    { value: 0, label: 'Mode 0 - Basic wake/hold', description: 'Equivalent to WM0' },
    { value: 1, label: 'Mode 1 - Conditional wake', description: 'Equivalent to WM1' },
    { value: 2, label: 'Mode 2 - Active period wake', description: 'Equivalent to WM2' },
    { value: 9, label: 'Mode 9 - Auto header (Mode 1)', description: 'Auto header formatting with Mode 1' },
    { value: 10, label: 'Mode A - Auto header (Mode 2)', description: 'Auto header formatting with Mode 2' },
    { value: 11, label: 'Mode B - Auto header (Mode 0)', description: 'Auto header formatting with Mode 0' }
  ];

  const ISO_MODES = [
    { value: 0, label: 'Disabled', description: 'Wake/hold sequence disabled' },
    { value: 1, label: 'Enabled', description: 'Wake/hold sequence enabled' }
  ];

  // Protocol ranges from datasheet
  const VT_PROTOCOLS = {
    can: Array.from({length: 40}, (_, i) => ({ value: 101 + i, label: `Protocol ${(101 + i).toString(16).toUpperCase()}` })),
    iso: Array.from({length: 40}, (_, i) => ({ value: 101 + i, label: `Protocol ${(101 + i).toString(16).toUpperCase()}` }))
  };

  const validateCANHeader = (header) => {
    // Support 11-bit (hhh), 29-bit (hhhhhhhh), or XX for default
    if (header === 'XX') return true;
    return /^[0-9A-Fa-f]{3}$/.test(header) || /^[0-9A-Fa-f]{8}$/.test(header);
  };

  const validateISOHeader = (header) => {
    // ISO header must be specified (C133F1 format)
    return /^[0-9A-Fa-f]{6}$/.test(header);
  };

  const validateCANData = (data) => {
    // 1-8 bytes, space separated hex
    const bytes = data.trim().split(/\s+/);
    return bytes.length >= 1 && bytes.length <= 8 && 
           bytes.every(byte => /^[0-9A-Fa-f]{2}$/.test(byte));
  };

  const validateISOData = (data) => {
    // 1-5 bytes, space separated hex
    const bytes = data.trim().split(/\s+/);
    return bytes.length >= 1 && bytes.length <= 5 && 
           bytes.every(byte => /^[0-9A-Fa-f]{2}$/.test(byte));
  };

  const validatePeriod = (period) => {
    // Period in 20ms units (hh format), XX for default
    if (period === 'XX') return true;
    const num = parseInt(period);
    return !isNaN(num) && num >= 1 && num <= 255;
  };

  const addSequence = () => {
    const isValid = activeTab === 'can' 
      ? validateCANHeader(newSequence.header) && validateCANData(newSequence.data)
      : validateISOHeader(newSequence.header) && validateISOData(newSequence.data);
    
    if (!isValid) {
      alert(`Invalid ${activeTab.toUpperCase()} sequence format`);
      return;
    }

    if (!validatePeriod(newSequence.period.toString())) {
      alert('Invalid period value (1-255 or XX)');
      return;
    }

    // Check if sequence number already exists
    const existingSequence = sequences[activeTab].find(seq => 
      seq.sequenceNumber === newSequence.sequenceNumber
    );
    
    if (existingSequence) {
      if (!window.confirm(`Sequence ${newSequence.sequenceNumber} already exists. Replace it?`)) {
        return;
      }
      updateSequence(existingSequence.id, newSequence);
    } else {
      const sequence = {
        id: Date.now(),
        ...newSequence,
        timestamp: new Date().toISOString()
      };

      setSequences(prev => ({
        ...prev,
        [activeTab]: [...prev[activeTab], sequence].sort((a, b) => a.sequenceNumber - b.sequenceNumber)
      }));
    }

    setNewSequence({
      sequenceNumber: 1,
      protocol: '',
      header: '',
      data: '',
      period: 100,
      mode: 0,
      description: '',
      enabled: true
    });
    setShowAddForm(false);
  };

  const deleteSequence = (id) => {
    setSequences(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(seq => seq.id !== id)
    }));
  };

  const updateSequence = (id, updates) => {
    setSequences(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(seq =>
        seq.id === id ? { ...seq, ...updates } : seq
      )
    }));
    setEditingId(null);
  };

  const generateVTCommand = (sequence) => {
    if (activeTab === 'can') {
      const protocol = sequence.protocol || 'XX';
      const header = sequence.header || 'XX';
      const period = sequence.period === 'XX' ? 'XX' : sequence.period.toString(16).toUpperCase().padStart(2, '0');
      
      return `VT CAN_WM ${sequence.sequenceNumber}, ${protocol}, ${header}, ${sequence.data}, ${period}, ${sequence.mode}`;
    } else {
      const protocol = sequence.protocol || 'XX';
      const period = sequence.period === 'XX' ? 'XX' : sequence.period.toString(16).toUpperCase().padStart(2, '0');
      
      return `VT ISO_WM ${sequence.sequenceNumber}, ${protocol}, ${sequence.header}, ${sequence.data}, ${period}, ${sequence.mode}`;
    }
  };

  const generateDeleteCommand = (sequenceNumber) => {
    return activeTab === 'can' 
      ? `VT DEL_CAN_WM ${sequenceNumber}`
      : `VT DEL_ISO_WM ${sequenceNumber}`;
  };

  const generateDisplayCommand = (sequenceNumber) => {
    return activeTab === 'can'
      ? `VT DISP_CAN_WM ${sequenceNumber}`
      : `VT DISP_ISO_WM ${sequenceNumber}`;
  };

  const exportSequences = () => {
    const commands = sequences[activeTab].map(seq => generateVTCommand(seq)).join('\n');
    const blob = new Blob([commands], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mic3x2x_${activeTab}_wakeup_sequences.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAllCommands = () => {
    const commands = sequences[activeTab].map(seq => generateVTCommand(seq)).join('\n');
    navigator.clipboard.writeText(commands);
    alert('Commands copied to clipboard');
  };

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

  const SequenceCard = ({ sequence }) => {
    const [editData, setEditData] = useState(sequence);
    const isEditing = editingId === sequence.id;
    const modes = activeTab === 'can' ? CAN_MODES : ISO_MODES;
    const currentMode = modes.find(mode => mode.value === sequence.mode);

    return (
      <div className={`bg-white border-2 rounded-lg p-4 shadow-sm ${
        sequence.enabled ? 'border-green-200' : 'border-gray-200'
      }`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
              sequence.enabled ? 'bg-green-500' : 'bg-gray-400'
            }`}>
              {sequence.sequenceNumber}
            </div>
            <div>
              <div className="font-semibold">
                {sequence.description || `${activeTab.toUpperCase()} Wake Sequence ${sequence.sequenceNumber}`}
              </div>
              <div className="text-sm text-gray-500">
                Protocol: {sequence.protocol || 'Any'} | Period: {sequence.period === 'XX' ? 'Default' : `${sequence.period * 20}ms`}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-1">
            {isEditing ? (
              <>
                <button
                  onClick={() => updateSequence(sequence.id, editData)}
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
                  onClick={() => setEditingId(sequence.id)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => deleteSequence(sequence.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Sequence Number (1-8)</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={editData.sequenceNumber}
                  onChange={(e) => setEditData({...editData, sequenceNumber: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Protocol</label>
                <input
                  type="text"
                  value={editData.protocol}
                  onChange={(e) => setEditData({...editData, protocol: e.target.value.toUpperCase()})}
                  className="w-full p-2 border rounded text-sm"
                  placeholder="XX for any"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Header</label>
              <input
                type="text"
                value={editData.header}
                onChange={(e) => setEditData({...editData, header: e.target.value.toUpperCase()})}
                className="w-full p-2 border rounded text-sm"
                placeholder={activeTab === 'can' ? "7DF or 18DA10F1 or XX" : "C133F1"}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Data ({activeTab === 'can' ? '1-8' : '1-5'} bytes)</label>
              <input
                type="text"
                value={editData.data}
                onChange={(e) => setEditData({...editData, data: e.target.value.toUpperCase()})}
                className="w-full p-2 border rounded text-sm"
                placeholder="01 3E 00 00 00 00 00 00"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Period (20ms units)</label>
                <input
                  type="text"
                  value={editData.period}
                  onChange={(e) => setEditData({...editData, period: e.target.value})}
                  className="w-full p-2 border rounded text-sm"
                  placeholder="64 (2000ms) or XX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mode</label>
                <select
                  value={editData.mode}
                  onChange={(e) => setEditData({...editData, mode: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded text-sm"
                >
                  {modes.map(mode => (
                    <option key={mode.value} value={mode.value}>{mode.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={editData.description}
                onChange={(e) => setEditData({...editData, description: e.target.value})}
                className="w-full p-2 border rounded text-sm"
                placeholder="Optional description"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={editData.enabled}
                onChange={(e) => setEditData({...editData, enabled: e.target.checked})}
                className="mr-2"
              />
              <label className="text-sm">Sequence enabled</label>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-600">Header:</div>
                <div className="font-mono text-blue-600">{sequence.header || 'Default'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Mode:</div>
                <div className="text-sm">{currentMode?.label}</div>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-600">Data:</div>
              <div className="font-mono text-lg text-green-600 bg-gray-50 p-2 rounded">
                {sequence.data}
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              {currentMode?.description}
            </div>
            
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <div className="text-xs font-semibold mb-2">VT Commands:</div>
              <div className="space-y-1">
                <div className="font-mono text-xs text-blue-600">
                  {generateVTCommand(sequence)}
                </div>
                <div className="font-mono text-xs text-red-600">
                  {generateDeleteCommand(sequence.sequenceNumber)}
                </div>
                <div className="font-mono text-xs text-green-600">
                  {generateDisplayCommand(sequence.sequenceNumber)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Zap className="text-yellow-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-800">MIC3X2X Wake/Hold Sequence Manager</h1>
          <div className="text-sm text-gray-500">
            Enhanced wake sequences (8 max per protocol type)
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6">
          <TabButton tab="can" label="CAN Wake Sequences" count={sequences.can.length} />
          <TabButton tab="iso" label="ISO Wake Sequences" count={sequences.iso.length} />
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              <Plus size={16} />
              <span>Add Sequence</span>
            </button>
            
            <button
              onClick={copyAllCommands}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              disabled={sequences[activeTab].length === 0}
            >
              <Copy size={16} />
              <span>Copy Commands</span>
            </button>
            
            <button
              onClick={exportSequences}
              className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
              disabled={sequences[activeTab].length === 0}
            >
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Sequence Limit Warning */}
        {sequences[activeTab].length >= 7 && (
          <div className="flex items-center space-x-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 mb-4">
            <AlertCircle className="text-yellow-600" size={16} />
            <span className="text-yellow-700">
              Approaching limit: {sequences[activeTab].length}/8 wake sequences
            </span>
          </div>
        )}

        {/* Add Sequence Form */}
        {showAddForm && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-3">Add New {activeTab.toUpperCase()} Wake Sequence</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Sequence # (1-8)</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={newSequence.sequenceNumber}
                    onChange={(e) => setNewSequence({...newSequence, sequenceNumber: parseInt(e.target.value)})}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Protocol</label>
                  <input
                    type="text"
                    value={newSequence.protocol}
                    onChange={(e) => setNewSequence({...newSequence, protocol: e.target.value.toUpperCase()})}
                    className="w-full p-2 border rounded"
                    placeholder="101-13F or XX"
                  />
                  <div className="text-xs text-gray-500">XX = any protocol</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Header</label>
                  <input
                    type="text"
                    value={newSequence.header}
                    onChange={(e) => setNewSequence({...newSequence, header: e.target.value.toUpperCase()})}
                    className="w-full p-2 border rounded"
                    placeholder={activeTab === 'can' ? "7DF or XX" : "C133F1"}
                  />
                  <div className="text-xs text-gray-500">
                    {activeTab === 'can' ? 'XX = use default' : 'Required for ISO'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Mode</label>
                  <select
                    value={newSequence.mode}
                    onChange={(e) => setNewSequence({...newSequence, mode: parseInt(e.target.value)})}
                    className="w-full p-2 border rounded"
                  >
                    {(activeTab === 'can' ? CAN_MODES : ISO_MODES).map(mode => (
                      <option key={mode.value} value={mode.value}>{mode.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Data ({activeTab === 'can' ? '1-8' : '1-5'} bytes, hex)
                  </label>
                  <input
                    type="text"
                    value={newSequence.data}
                    onChange={(e) => setNewSequence({...newSequence, data: e.target.value.toUpperCase()})}
                    className="w-full p-2 border rounded"
                    placeholder="01 3E 00 00 00 00 00 00"
                  />
                  <div className="text-xs text-gray-500">Space-separated hex bytes</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Period (20ms units)</label>
                  <input
                    type="text"
                    value={newSequence.period}
                    onChange={(e) => setNewSequence({...newSequence, period: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="64 (2000ms)"
                  />
                  <div className="text-xs text-gray-500">1-255 or XX for default</div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={newSequence.description}
                  onChange={(e) => setNewSequence({...newSequence, description: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Keep-alive for ECU module"
                />
              </div>
            </div>
            
            <div className="flex space-x-2 mt-4">
              <button
                onClick={addSequence}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add Sequence
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

        {/* Sequences List */}
        <div className="space-y-4">
          {sequences[activeTab].length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Zap size={48} className="mx-auto mb-4 opacity-50" />
              <p>No {activeTab.toUpperCase()} wake sequences configured</p>
              <p className="text-sm">Add a sequence to maintain ECU connections</p>
            </div>
          ) : (
            sequences[activeTab].map(sequence => (
              <SequenceCard key={sequence.id} sequence={sequence} />
            ))
          )}
        </div>

        {/* Command Reference */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-3">MIC3X2X Wake Sequence Commands</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-600 mb-2">CAN Commands:</div>
              <div className="space-y-1 font-mono text-xs">
                <div>VT CAN_WM No, Protocol, Header, Data, Period, Mode</div>
                <div>VT DEL_CAN_WM No     # Delete sequence</div>
                <div>VT DISP_CAN_WM No   # Display sequence</div>
                <div>VT DISP_CAN_WM F    # Display all</div>
              </div>
            </div>
            <div>
              <div className="font-medium text-green-600 mb-2">ISO Commands:</div>
              <div className="space-y-1 font-mono text-xs">
                <div>VT ISO_WM No, Protocol, Header, Data, Period, Ctrl</div>
                <div>VT DEL_ISO_WM No     # Delete sequence</div>
                <div>VT DISP_ISO_WM No   # Display sequence</div>
                <div>VT DISP_ISO_WM F    # Display all</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="font-medium text-purple-600 mb-2">Mode Descriptions:</div>
            <div className="text-xs space-y-1">
              {activeTab === 'can' ? (
                <>
                  <div>• Mode 0,1,2: Basic wake modes (equivalent to WM0,1,2)</div>
                  <div>• Mode 9,A,B: Auto header formatting with ATSH/VTSET_HD</div>
                  <div>• Bit 3 set: Auto ID change with ATSH + extension address support</div>
                </>
              ) : (
                <>
                  <div>• Mode 0: Disable wake/hold sequence</div>
                  <div>• Mode 1: Enable wake/hold sequence</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MIC3X2XWakeupManager;