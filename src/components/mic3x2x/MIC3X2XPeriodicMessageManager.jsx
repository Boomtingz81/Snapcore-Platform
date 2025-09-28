import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Trash2, Edit3, Check, X, Play, Pause, Clock, Activity, Settings, Download, AlertTriangle } from 'lucide-react';

const MIC3X2XPeriodicMessageManager = () => {
  const [activeTab, setActiveTab] = useState('pmqe');
  const [messages, setMessages] = useState({
    pmqe: [],
    wmgp: []
  });
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newMessage, setNewMessage] = useState({
    number: 1,
    protocol: '',
    baudrate: 500000,
    header: '',
    data: '',
    period: 1000,
    mode: 1,
    description: '',
    enabled: true
  });

  // PMQE Modes (simpler periodic messages)
  const PMQE_MODES = [
    { value: 1, label: 'Mode 01', description: 'Send if no message in AT SW time' },
    { value: 2, label: 'Mode 02', description: 'Send if no message and not receiving' },
    { value: 3, label: 'Mode 03', description: 'Send at constant rate' },
    { value: 9, label: 'Mode 09', description: 'Mode 01 + auto header formatting' },
    { value: 10, label: 'Mode 0A', description: 'Mode 02 + auto header formatting' },
    { value: 11, label: 'Mode 0B', description: 'Mode 03 + auto header formatting' },
    { value: 17, label: 'Mode 11', description: 'Mode 01 + auto data formatting' },
    { value: 18, label: 'Mode 12', description: 'Mode 02 + auto data formatting' },
    { value: 19, label: 'Mode 13', description: 'Mode 03 + auto data formatting' },
    { value: 25, label: 'Mode 19', description: 'Mode 01 + auto header + data formatting' },
    { value: 26, label: 'Mode 1A', description: 'Mode 02 + auto header + data formatting' },
    { value: 27, label: 'Mode 1B', description: 'Mode 03 + auto header + data formatting' }
  ];

  // WMGP Modes (advanced multi-protocol periodic messages)
  const WMGP_MODES = [
    { value: 1, label: 'Mode 01', description: 'Regular PM, CF frame cannot interrupt' },
    { value: 2, label: 'Mode 02', description: 'Restart PM timeout after request/response' },
    { value: 3, label: 'Mode 03', description: 'Fixed PM interval' },
    { value: 9, label: 'Mode 09', description: 'Mode 01 + auto header' },
    { value: 10, label: 'Mode 0A', description: 'Mode 02 + auto header' },
    { value: 11, label: 'Mode 0B', description: 'Mode 03 + auto header' },
    { value: 17, label: 'Mode 11', description: 'Mode 01 + auto data formatting' },
    { value: 18, label: 'Mode 12', description: 'Mode 02 + auto data formatting' },
    { value: 19, label: 'Mode 13', description: 'Mode 03 + auto data formatting' },
    { value: 25, label: 'Mode 19', description: 'Mode 01 + auto header + data' },
    { value: 26, label: 'Mode 1A', description: 'Mode 02 + auto header + data' },
    { value: 27, label: 'Mode 1B', description: 'Mode 03 + auto header + data' },
    { value: 33, label: 'Mode 21', description: 'Mode 11 + auto block after busy' },
    { value: 34, label: 'Mode 22', description: 'Mode 12 + auto block after busy' },
    { value: 35, label: 'Mode 23', description: 'Mode 13 + auto block after busy' },
    { value: 49, label: 'Mode 31', description: 'Mode 11 + immediate PM after busy' },
    { value: 50, label: 'Mode 32', description: 'Mode 12 + immediate PM after busy' },
    { value: 51, label: 'Mode 33', description: 'Mode 13 + immediate PM after busy' }
  ];

  // WMGP Protocol Support
  const WMGP_PROTOCOLS = [
    { value: 'B', label: 'Protocol B (User1)' },
    { value: 'C', label: 'Protocol C (User2)' },
    { value: 'D', label: 'Protocol D (User3)' },
    { value: 'E', label: 'Protocol E (User4)' },
    { value: 'F', label: 'Protocol F (User5)' },
    { value: '101', label: 'VT Protocol 101' },
    { value: '13F', label: 'VT Protocol 13F' },
    { value: '221', label: 'ST Protocol 221' },
    { value: '254', label: 'ST Protocol 254' }
  ];

  const validateHeader = (header) => {
    // Support 11-bit (hhh), 29-bit (hhhhhhhh), or 24-bit (hhhhhh)
    return /^[0-9A-Fa-f]{3}$/.test(header) || 
           /^[0-9A-Fa-f]{6}$/.test(header) || 
           /^[0-9A-Fa-f]{8}$/.test(header);
  };

  const validateData = (data) => {
    // 1-8 bytes, space separated hex
    const bytes = data.trim().split(/\s+/);
    return bytes.length >= 1 && bytes.length <= 8 && 
           bytes.every(byte => /^[0-9A-Fa-f]{2}$/.test(byte));
  };

  const addMessage = () => {
    if (!validateHeader(newMessage.header)) {
      alert('Invalid header format (hhh, hhhhhh, or hhhhhhhh)');
      return;
    }
    
    if (!validateData(newMessage.data)) {
      alert('Invalid data format (1-8 hex bytes, space separated)');
      return;
    }

    if (newMessage.period < 1 || newMessage.period > 65535) {
      alert('Period must be between 1-65535 ms');
      return;
    }

    // Check if message number already exists
    const existingMessage = messages[activeTab].find(msg => 
      msg.number === newMessage.number
    );
    
    if (existingMessage) {
      if (!window.confirm(`Message ${newMessage.number} already exists. Replace it?`)) {
        return;
      }
      updateMessage(existingMessage.id, newMessage);
    } else {
      const message = {
        id: Date.now(),
        ...newMessage,
        timestamp: new Date().toISOString(),
        active: false,
        framesSent: 0
      };

      setMessages(prev => ({
        ...prev,
        [activeTab]: [...prev[activeTab], message].sort((a, b) => a.number - b.number)
      }));
    }

    setNewMessage({
      number: 1,
      protocol: '',
      baudrate: 500000,
      header: '',
      data: '',
      period: 1000,
      mode: 1,
      description: '',
      enabled: true
    });
    setShowAddForm(false);
  };

  const deleteMessage = (id) => {
    setMessages(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(msg => msg.id !== id)
    }));
  };

  const updateMessage = (id, updates) => {
    setMessages(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(msg =>
        msg.id === id ? { ...msg, ...updates } : msg
      )
    }));
    setEditingId(null);
  };

  const toggleMessage = (id) => {
    setMessages(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(msg =>
        msg.id === id ? { ...msg, active: !msg.active } : msg
      )
    }));
  };

  const generateCommand = (message) => {
    if (activeTab === 'pmqe') {
      return `VT PMQE ${message.number}, ${message.header}, ${message.data}, ${message.period}, ${message.mode.toString(16).toUpperCase()}`;
    } else {
      return `VT WMGP ${message.number}, ${message.protocol}, ${message.baudrate}, ${message.header}, ${message.data}, ${message.period}, ${message.mode.toString(16).toUpperCase()}`;
    }
  };

  const generateDeleteCommand = (number) => {
    return activeTab === 'pmqe' 
      ? `VT PMQE ${number}`
      : `VT WMGP ${number}`;
  };

  const generatePrintCommand = (number) => {
    return activeTab === 'pmqe'
      ? `VT PMQE_PRT ${number}`
      : `VT WMGP_PRT ${number}`;
  };

  const clearAllMessages = () => {
    if (window.confirm(`Clear all ${activeTab.toUpperCase()} messages?`)) {
      setMessages(prev => ({
        ...prev,
        [activeTab]: []
      }));
    }
  };

  const exportMessages = () => {
    const commands = messages[activeTab].map(msg => generateCommand(msg)).join('\n');
    const blob = new Blob([commands], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mic3x2x_${activeTab}_messages.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Simulate frame counting for active messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessages(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].map(msg =>
          msg.active ? { ...msg, framesSent: msg.framesSent + 1 } : msg
        )
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTab]);

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

  const MessageCard = ({ message }) => {
    const [editData, setEditData] = useState(message);
    const isEditing = editingId === message.id;
    const modes = activeTab === 'pmqe' ? PMQE_MODES : WMGP_MODES;
    const currentMode = modes.find(mode => mode.value === message.mode);

    return (
      <div className={`bg-white border-2 rounded-lg p-4 shadow-sm ${
        message.active ? 'border-green-200 bg-green-50' : 'border-gray-200'
      }`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
              message.active ? 'bg-green-500' : 'bg-gray-400'
            }`}>
              {message.number}
            </div>
            <div>
              <div className="font-semibold">
                {message.description || `${activeTab.toUpperCase()} Message ${message.number}`}
              </div>
              <div className="text-sm text-gray-500">
                {activeTab === 'wmgp' && `Protocol: ${message.protocol} • `}
                Period: {message.period}ms • Frames: {message.framesSent.toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => toggleMessage(message.id)}
              className={`p-1 rounded ${
                message.active 
                  ? 'text-red-600 hover:bg-red-50' 
                  : 'text-green-600 hover:bg-green-50'
              }`}
            >
              {message.active ? <Pause size={16} /> : <Play size={16} />}
            </button>
            {isEditing ? (
              <>
                <button
                  onClick={() => updateMessage(message.id, editData)}
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
                  onClick={() => setEditingId(message.id)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => deleteMessage(message.id)}
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
                <label className="block text-sm font-medium mb-1">Message Number (1-8)</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={editData.number}
                  onChange={(e) => setEditData({...editData, number: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded text-sm"
                />
              </div>
              {activeTab === 'wmgp' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Protocol</label>
                  <select
                    value={editData.protocol}
                    onChange={(e) => setEditData({...editData, protocol: e.target.value})}
                    className="w-full p-2 border rounded text-sm"
                  >
                    {WMGP_PROTOCOLS.map(proto => (
                      <option key={proto.value} value={proto.value}>{proto.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            {activeTab === 'wmgp' && (
              <div>
                <label className="block text-sm font-medium mb-1">Baudrate</label>
                <input
                  type="number"
                  value={editData.baudrate}
                  onChange={(e) => setEditData({...editData, baudrate: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded text-sm"
                  placeholder="500000"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1">Header</label>
              <input
                type="text"
                value={editData.header}
                onChange={(e) => setEditData({...editData, header: e.target.value.toUpperCase()})}
                className="w-full p-2 border rounded text-sm"
                placeholder="710"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Data (1-8 bytes)</label>
              <input
                type="text"
                value={editData.data}
                onChange={(e) => setEditData({...editData, data: e.target.value.toUpperCase()})}
                className="w-full p-2 border rounded text-sm"
                placeholder="3E 80"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Period (ms)</label>
                <input
                  type="number"
                  value={editData.period}
                  onChange={(e) => setEditData({...editData, period: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded text-sm"
                  min="1"
                  max="65535"
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
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-600">Header:</div>
                <div className="font-mono text-blue-600">{message.header}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Mode:</div>
                <div className="text-sm">{currentMode?.label}</div>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-600">Data:</div>
              <div className="font-mono text-lg text-green-600 bg-gray-50 p-2 rounded">
                {message.data}
              </div>
            </div>
            
            {activeTab === 'wmgp' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-600">Protocol:</div>
                  <div className="text-sm">{message.protocol}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Baudrate:</div>
                  <div className="text-sm">{message.baudrate.toLocaleString()}</div>
                </div>
              </div>
            )}
            
            <div className="text-xs text-gray-500">
              {currentMode?.description}
            </div>
            
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <div className="text-xs font-semibold mb-2">Commands:</div>
              <div className="space-y-1">
                <div className="font-mono text-xs text-blue-600">
                  {generateCommand(message)}
                </div>
                <div className="font-mono text-xs text-red-600">
                  {generateDeleteCommand(message.number)}
                </div>
                <div className="font-mono text-xs text-green-600">
                  {generatePrintCommand(message.number)}
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
          <Activity className="text-green-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-800">MIC3X2X Periodic Message Manager</h1>
          <div className="text-sm text-gray-500">
            Enhanced PMQE/WMGP commands (8 messages max)
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6">
          <TabButton tab="pmqe" label="PMQE Messages" count={messages.pmqe.length} />
          <TabButton tab="wmgp" label="WMGP Messages" count={messages.wmgp.length} />
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              <Plus size={16} />
              <span>Add Message</span>
            </button>
            
            <button
              onClick={clearAllMessages}
              className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              disabled={messages[activeTab].length === 0}
            >
              <Trash2 size={16} />
              <span>Clear All</span>
            </button>
            
            <button
              onClick={exportMessages}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              disabled={messages[activeTab].length === 0}
            >
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Message Limit Warning */}
        {messages[activeTab].length >= 7 && (
          <div className="flex items-center space-x-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 mb-4">
            <AlertTriangle className="text-yellow-600" size={16} />
            <span className="text-yellow-700">
              Approaching limit: {messages[activeTab].length}/8 periodic messages
            </span>
          </div>
        )}

        {/* Add Message Form */}
        {showAddForm && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-3">Add New {activeTab.toUpperCase()} Message</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Message # (1-8)</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={newMessage.number}
                    onChange={(e) => setNewMessage({...newMessage, number: parseInt(e.target.value)})}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                {activeTab === 'wmgp' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Protocol</label>
                      <select
                        value={newMessage.protocol}
                        onChange={(e) => setNewMessage({...newMessage, protocol: e.target.value})}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Select Protocol</option>
                        {WMGP_PROTOCOLS.map(proto => (
                          <option key={proto.value} value={proto.value}>{proto.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Baudrate</label>
                      <input
                        type="number"
                        value={newMessage.baudrate}
                        onChange={(e) => setNewMessage({...newMessage, baudrate: parseInt(e.target.value)})}
                        className="w-full p-2 border rounded"
                        placeholder="500000"
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-1">Header</label>
                  <input
                    type="text"
                    value={newMessage.header}
                    onChange={(e) => setNewMessage({...newMessage, header: e.target.value.toUpperCase()})}
                    className="w-full p-2 border rounded"
                    placeholder="710"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Data (1-8 bytes, hex)</label>
                  <input
                    type="text"
                    value={newMessage.data}
                    onChange={(e) => setNewMessage({...newMessage, data: e.target.value.toUpperCase()})}
                    className="w-full p-2 border rounded"
                    placeholder="3E 80"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Period (ms)</label>
                  <input
                    type="number"
                    value={newMessage.period}
                    onChange={(e) => setNewMessage({...newMessage, period: parseInt(e.target.value)})}
                    className="w-full p-2 border rounded"
                    min="1"
                    max="65535"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Mode</label>
                  <select
                    value={newMessage.mode}
                    onChange={(e) => setNewMessage({...newMessage, mode: parseInt(e.target.value)})}
                    className="w-full p-2 border rounded"
                  >
                    {(activeTab === 'pmqe' ? PMQE_MODES : WMGP_MODES).map(mode => (
                      <option key={mode.value} value={mode.value}>{mode.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={newMessage.description}
                  onChange={(e) => setNewMessage({...newMessage, description: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Keep-alive for engine ECU"
                />
              </div>
            </div>
            
            <div className="flex space-x-2 mt-4">
              <button
                onClick={addMessage}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add Message
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

        {/* Messages List */}
        <div className="space-y-4">
          {messages[activeTab].length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Activity size={48} className="mx-auto mb-4 opacity-50" />
              <p>No {activeTab.toUpperCase()} messages configured</p>
              <p className="text-sm">Add periodic messages to maintain ECU connections</p>
            </div>
          ) : (
            messages[activeTab].map(message => (
              <MessageCard key={message.id} message={message} />
            ))
          )}
        </div>

        {/* Command Reference */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-3">MIC3X2X Periodic Message Commands</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-600 mb-2">PMQE Commands:</div>
              <div className="space-y-1 font-mono text-xs">
                <div>VT PMQE No, Header, Data, Period, Mode</div>
                <div>VT PMQE No             # Delete message</div>
                <div>VT PMQE_PRT No        # Print message</div>
                <div>VT PMQE FF            # Delete all</div>
              </div>
            </div>
            <div>
              <div className="font-medium text-green-600 mb-2">WMGP Commands:</div>
              <div className="space-y-1 font-mono text-xs">
                <div>VT WMGP No, Protocol, Baudrate, Header, Data, Period, Mode</div>
                <div>VT WMGP No             # Delete message</div>
                <div>VT WMGP_PRT No        # Print message</div>
                <div>VT WMGP FF            # Delete all</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="font-medium text-purple-600 mb-2">Mode Descriptions:</div>
            <div className="text-xs space-y-1">
              <div><strong>PMQE Modes:</strong> Simpler periodic messages for basic keep-alive</div>
              <div><strong>WMGP Modes:</strong> Advanced multi-protocol periodic messages</div>
              <div>• Mode x1-x3: Basic timing modes</div>
              <div>• Mode x9-xB: Auto header formatting (ATSH/VTSET_HD)</div>
              <div>• Mode 1x: Auto data formatting for ISO15765</div>
              <div>• Mode 2x-3x: Enhanced busy response handling</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="font-medium text-orange-600 mb-2">Key Differences:</div>
            <div className="text-xs space-y-1">
              <div><strong>PMQE:</strong> Protocol-independent, simpler configuration</div>
              <div><strong>WMGP:</strong> Protocol-specific, supports custom baudrates</div>
              <div><strong>Both:</strong> Share 8-message buffer pool (exclusive use)</div>
              <div><strong>Compatibility:</strong> Works only with CAN protocols</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MIC3X2XPeriodicMessageManager;