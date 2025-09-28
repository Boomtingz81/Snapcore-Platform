import React, { useState, useCallback, useEffect } from 'react';
import { HardDrive, Edit, Save, Download, Upload, Trash2, Eye, EyeOff, Search, AlertTriangle, Info } from 'lucide-react';

const MIC3X2XUserStorage = () => {
  const [storageData, setStorageData] = useState(new Array(256).fill(0x00));
  const [viewMode, setViewMode] = useState('hex'); // 'hex', 'ascii', 'binary'
  const [selectedAddress, setSelectedAddress] = useState(0x00);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [writeOperations, setWriteOperations] = useState([]);
  const [writeCount, setWriteCount] = useState(0);
  
  const [writeForm, setWriteForm] = useState({
    position: '00',
    data: '',
    description: ''
  });

  // EEPROM write limits from datasheet
  const MAX_WRITE_CYCLES = 10000;
  const WARNING_THRESHOLD = 8000;

  const parseHexInput = (input) => {
    // Remove spaces and validate hex format
    const cleanInput = input.replace(/\s+/g, '').toUpperCase();
    if (!/^[0-9A-F]*$/.test(cleanInput)) {
      throw new Error('Invalid hex format');
    }
    
    // Convert to byte array (max 8 bytes per operation)
    const bytes = [];
    for (let i = 0; i < cleanInput.length; i += 2) {
      if (i + 1 < cleanInput.length) {
        bytes.push(parseInt(cleanInput.substr(i, 2), 16));
      }
    }
    
    if (bytes.length === 0 || bytes.length > 8) {
      throw new Error('Data must be 1-8 bytes');
    }
    
    return bytes;
  };

  const validatePosition = (pos) => {
    const position = parseInt(pos, 16);
    return !isNaN(position) && position >= 0x00 && position <= 0xFF;
  };

  const writeToEEPROM = () => {
    try {
      if (!validatePosition(writeForm.position)) {
        alert('Invalid position (00-FF)');
        return;
      }
      
      const startPos = parseInt(writeForm.position, 16);
      const dataBytes = parseHexInput(writeForm.data);
      
      if (startPos + dataBytes.length > 256) {
        alert('Write would exceed EEPROM boundary');
        return;
      }
      
      // Update storage
      const newStorage = [...storageData];
      dataBytes.forEach((byte, index) => {
        newStorage[startPos + index] = byte;
      });
      setStorageData(newStorage);
      
      // Track write operation
      const operation = {
        id: Date.now(),
        position: startPos,
        length: dataBytes.length,
        data: dataBytes,
        description: writeForm.description,
        timestamp: new Date().toISOString()
      };
      
      setWriteOperations(prev => [...prev, operation]);
      setWriteCount(prev => prev + 1);
      
      // Clear form
      setWriteForm({ position: '00', data: '', description: '' });
      
      // Show warning if approaching write limit
      if (writeCount + 1 >= WARNING_THRESHOLD) {
        alert(`Warning: Approaching EEPROM write limit (${writeCount + 1}/${MAX_WRITE_CYCLES})`);
      }
      
    } catch (error) {
      alert(`Write error: ${error.message}`);
    }
  };

  const readFromEEPROM = (position, length) => {
    const startPos = parseInt(position, 16);
    if (startPos + length > 256) {
      return storageData.slice(startPos);
    }
    return storageData.slice(startPos, startPos + length);
  };

  const generateWriteCommand = (pos, data) => {
    return `VT WT_EE ${pos.toString(16).toUpperCase().padStart(2, '0')}, ${data.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')}`;
  };

  const generateReadCommand = (pos, length) => {
    return `VT RD_EE ${pos.toString(16).toUpperCase().padStart(2, '0')}, ${length.toString(16).toUpperCase().padStart(2, '0')}`;
  };

  const exportStorage = () => {
    const hexDump = [];
    for (let i = 0; i < 256; i += 16) {
      const row = storageData.slice(i, i + 16);
      const hexStr = row.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
      const asciiStr = row.map(b => b >= 32 && b <= 126 ? String.fromCharCode(b) : '.').join('');
      hexDump.push(`${i.toString(16).toUpperCase().padStart(2, '0')}: ${hexStr} | ${asciiStr}`);
    }
    
    const content = [
      '# MIC3X2X User EEPROM Dump',
      '# 256-byte user storage area',
      `# Generated: ${new Date().toISOString()}`,
      `# Write operations: ${writeCount}/${MAX_WRITE_CYCLES}`,
      '',
      ...hexDump,
      '',
      '# Write History:',
      ...writeOperations.map(op => 
        `# ${op.timestamp}: ${generateWriteCommand(op.position, op.data)} - ${op.description}`
      )
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mic3x2x_eeprom_dump.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importStorage = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const lines = content.split('\n');
        const newStorage = new Array(256).fill(0x00);
        
        lines.forEach(line => {
          const hexMatch = line.match(/^([0-9A-F]{2}):\s*([0-9A-F\s]+)/i);
          if (hexMatch) {
            const addr = parseInt(hexMatch[1], 16);
            const hexData = hexMatch[2].replace(/\s+/g, '');
            for (let i = 0; i < hexData.length; i += 2) {
              if (addr + i/2 < 256) {
                newStorage[addr + i/2] = parseInt(hexData.substr(i, 2), 16);
              }
            }
          }
        });
        
        setStorageData(newStorage);
        alert('EEPROM data imported successfully');
      } catch (error) {
        alert(`Import error: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };

  const clearStorage = () => {
    if (window.confirm('Clear all EEPROM data? This cannot be undone.')) {
      setStorageData(new Array(256).fill(0x00));
      setWriteOperations([]);
      setWriteCount(0);
    }
  };

  const formatByte = (byte, mode) => {
    switch (mode) {
      case 'hex':
        return byte.toString(16).toUpperCase().padStart(2, '0');
      case 'ascii':
        return byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.';
      case 'binary':
        return byte.toString(2).padStart(8, '0');
      default:
        return byte.toString();
    }
  };

  const HexEditor = () => {
    const filteredAddresses = [];
    
    if (searchTerm) {
      const searchHex = searchTerm.toUpperCase();
      for (let i = 0; i < 256; i++) {
        const byteHex = formatByte(storageData[i], 'hex');
        if (byteHex.includes(searchHex) || i.toString(16).toUpperCase().includes(searchHex)) {
          filteredAddresses.push(i);
        }
      }
    }

    return (
      <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
        <div className="grid grid-cols-17 gap-1 mb-2">
          <div className="font-bold text-center">Addr</div>
          {Array.from({length: 16}, (_, i) => (
            <div key={i} className="font-bold text-center text-xs">
              {i.toString(16).toUpperCase()}
            </div>
          ))}
        </div>
        
        {Array.from({length: 16}, (_, row) => (
          <div key={row} className="grid grid-cols-17 gap-1 mb-1">
            <div className="font-bold text-center text-xs bg-gray-200 p-1 rounded">
              {(row * 16).toString(16).toUpperCase().padStart(2, '0')}
            </div>
            {Array.from({length: 16}, (_, col) => {
              const addr = row * 16 + col;
              const isSelected = addr === selectedAddress;
              const isFiltered = searchTerm && !filteredAddresses.includes(addr);
              
              return (
                <div
                  key={col}
                  className={`text-center p-1 rounded cursor-pointer text-xs ${
                    isSelected 
                      ? 'bg-blue-500 text-white' 
                      : isFiltered
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-white hover:bg-blue-100'
                  }`}
                  onClick={() => setSelectedAddress(addr)}
                  title={`Address: 0x${addr.toString(16).toUpperCase().padStart(2, '0')}\nValue: 0x${formatByte(storageData[addr], 'hex')}\nASCII: ${formatByte(storageData[addr], 'ascii')}`}
                >
                  {formatByte(storageData[addr], viewMode)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const AddressInfo = () => {
    const byte = storageData[selectedAddress];
    return (
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Address 0x{selectedAddress.toString(16).toUpperCase().padStart(2, '0')}</h3>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">Hex:</span> 0x{formatByte(byte, 'hex')}
            </div>
            <div>
              <span className="text-gray-600">Decimal:</span> {byte}
            </div>
            <div>
              <span className="text-gray-600">Binary:</span> {formatByte(byte, 'binary')}
            </div>
            <div>
              <span className="text-gray-600">ASCII:</span> '{formatByte(byte, 'ascii')}'
            </div>
          </div>
        </div>
        
        <div className="mt-3 p-2 bg-gray-50 rounded">
          <div className="text-xs font-semibold mb-1">Read Command:</div>
          <div className="font-mono text-xs text-blue-600">
            {generateReadCommand(selectedAddress, 1)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <HardDrive className="text-purple-600" size={28} />
            <h1 className="text-2xl font-bold text-gray-800">MIC3X2X User EEPROM Storage</h1>
            <div className="text-sm text-gray-500">
              256 bytes • {writeCount}/{MAX_WRITE_CYCLES} writes
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={exportStorage}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
            
            <label className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 cursor-pointer">
              <Upload size={16} />
              <span>Import</span>
              <input
                type="file"
                accept=".txt"
                onChange={importStorage}
                className="hidden"
              />
            </label>
            
            <button
              onClick={clearStorage}
              className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              <Trash2 size={16} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Write Cycle Warning */}
        {writeCount >= WARNING_THRESHOLD && (
          <div className="flex items-center space-x-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 mb-4">
            <AlertTriangle className="text-yellow-600" size={16} />
            <span className="text-yellow-700">
              Warning: {writeCount}/{MAX_WRITE_CYCLES} write cycles used. Approaching EEPROM endurance limit.
            </span>
          </div>
        )}

        {/* EEPROM Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-blue-600 font-semibold">Total Size</div>
            <div className="text-2xl font-bold">256 bytes</div>
            <div className="text-xs text-gray-600">User storage area</div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-green-600 font-semibold">Write Cycles</div>
            <div className="text-2xl font-bold">{writeCount}</div>
            <div className="text-xs text-gray-600">Out of {MAX_WRITE_CYCLES.toLocaleString()}</div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-purple-600 font-semibold">Selected</div>
            <div className="text-2xl font-bold">0x{selectedAddress.toString(16).toUpperCase().padStart(2, '0')}</div>
            <div className="text-xs text-gray-600">Current address</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-gray-600 font-semibold">Operations</div>
            <div className="text-2xl font-bold">{writeOperations.length}</div>
            <div className="text-xs text-gray-600">Total writes</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">View:</span>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="hex">Hex</option>
                <option value="ascii">ASCII</option>
                <option value="binary">Binary</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search hex..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
              className="p-2 border rounded w-32"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Hex Editor */}
          <div className="lg:col-span-3">
            <HexEditor />
          </div>
          
          {/* Address Info */}
          <div>
            <AddressInfo />
          </div>
        </div>

        {/* Write Operations */}
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Write to EEPROM</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium mb-1">Position (00-FF)</label>
                <input
                  type="text"
                  value={writeForm.position}
                  onChange={(e) => setWriteForm({...writeForm, position: e.target.value.toUpperCase()})}
                  className="w-full p-2 border rounded font-mono"
                  placeholder="00"
                  maxLength="2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Data (1-8 bytes, hex)</label>
                <input
                  type="text"
                  value={writeForm.data}
                  onChange={(e) => setWriteForm({...writeForm, data: e.target.value.toUpperCase()})}
                  className="w-full p-2 border rounded font-mono"
                  placeholder="01 02 03 04"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={writeForm.description}
                  onChange={(e) => setWriteForm({...writeForm, description: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="Optional description"
                />
              </div>
            </div>
            
            <button
              onClick={writeToEEPROM}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              <Save size={16} />
              <span>Write to EEPROM</span>
            </button>
            
            {writeForm.position && writeForm.data && (
              <div className="mt-3 p-2 bg-white rounded border">
                <div className="text-xs font-semibold mb-1">Generated Command:</div>
                <div className="font-mono text-xs text-green-600">
                  {(() => {
                    try {
                      const pos = parseInt(writeForm.position, 16);
                      const data = parseHexInput(writeForm.data);
                      return generateWriteCommand(pos, data);
                    } catch {
                      return 'Invalid input';
                    }
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Write History */}
        {writeOperations.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Write History ({writeOperations.length} operations)</h3>
            <div className="bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
              {writeOperations.slice().reverse().map((op, index) => (
                <div key={op.id} className="p-3 border-b border-gray-200 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-mono text-sm text-blue-600">
                        {generateWriteCommand(op.position, op.data)}
                      </div>
                      <div className="text-xs text-gray-600">
                        {op.description && `${op.description} • `}
                        {new Date(op.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      #{writeOperations.length - index}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Command Reference */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <Info size={16} />
            <span>MIC3X2X EEPROM Commands</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-600 mb-2">Write Commands:</div>
              <div className="space-y-1 font-mono text-xs">
                <div>VT WT_EE pos, data1 [data2...data8]</div>
                <div>VT WT_EE 00, 01 02 03 04 05 06 07</div>
                <div>VT WT_EE FF, AA          # Single byte</div>
              </div>
            </div>
            
            <div>
              <div className="font-medium text-green-600 mb-2">Read Commands:</div>
              <div className="space-y-1 font-mono text-xs">
                <div>VT RD_EE pos, length</div>
                <div>VT RD_EE 00, 10         # Read 16 bytes</div>
                <div>VT RD_EE 01, 15         # Read from 0x01</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-600">
            <div className="font-medium mb-1">Important Notes:</div>
            <div>• Maximum 10,000 write cycles per location</div>
            <div>• Write 1-8 bytes per operation</div>
            <div>• Read 1-255 bytes per operation</div>
            <div>• Position format: 00-FF (hex)</div>
            <div>• Data format: Space-separated hex bytes</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MIC3X2XUserStorage;