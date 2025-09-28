import React, { useState, useCallback, useEffect } from 'react';
import { Send, Package, CheckCircle, XCircle, AlertCircle, Download, Upload, Trash2, Clock, Zap } from 'lucide-react';

const MIC3X2XMultiFrameHandler = () => {
  const [transmissionState, setTransmissionState] = useState('idle'); // idle, rts, sending, complete, aborted
  const [packets, setPackets] = useState([]);
  const [currentPacket, setCurrentPacket] = useState(0);
  const [totalLength, setTotalLength] = useState(0);
  const [blockSize, setBlockSize] = useState(50);
  const [enableChecksum, setEnableChecksum] = useState(true);
  const [targetAddress, setTargetAddress] = useState('6F1-01');
  const [timeout, setTimeout] = useState(1000);
  const [responses, setResponses] = useState([]);
  
  const [dataInput, setDataInput] = useState('');
  const [transmissionLog, setTransmissionLog] = useState([]);

  // MIC3X2X limits from datasheet
  const MAX_TOTAL_LENGTH = 4128; // Enhanced from 1024
  const MAX_BLOCK_SIZE = 500;
  const MIN_TOTAL_LENGTH = 50;

  const calculateChecksum = (data) => {
    return data.reduce((sum, byte) => (sum + byte) & 0xFFFF, 0);
  };

  const parseHexData = (input) => {
    const cleanInput = input.replace(/\s+/g, '').toUpperCase();
    if (!/^[0-9A-F]*$/.test(cleanInput)) {
      throw new Error('Invalid hex format');
    }
    
    const bytes = [];
    for (let i = 0; i < cleanInput.length; i += 2) {
      if (i + 1 < cleanInput.length) {
        bytes.push(parseInt(cleanInput.substr(i, 2), 16));
      }
    }
    return bytes;
  };

  const splitIntoPackets = (data, blockSize) => {
    const packets = [];
    for (let i = 0; i < data.length; i += blockSize) {
      const packetData = data.slice(i, i + blockSize);
      const packetNumber = Math.floor(i / blockSize);
      const checksum = enableChecksum ? calculateChecksum(packetData) : null;
      
      packets.push({
        id: packetNumber,
        data: packetData,
        checksum,
        status: 'pending', // pending, sent, confirmed, error
        timestamp: null
      });
    }
    return packets;
  };

  const startTransmission = () => {
    try {
      if (!dataInput.trim()) {
        alert('Please enter data to transmit');
        return;
      }

      const data = parseHexData(dataInput);
      
      if (data.length < MIN_TOTAL_LENGTH) {
        alert(`Data must be at least ${MIN_TOTAL_LENGTH} bytes`);
        return;
      }
      
      if (data.length > MAX_TOTAL_LENGTH) {
        alert(`Data exceeds maximum length of ${MAX_TOTAL_LENGTH} bytes`);
        return;
      }
      
      if (blockSize > MAX_BLOCK_SIZE) {
        alert(`Block size exceeds maximum of ${MAX_BLOCK_SIZE} bytes`);
        return;
      }

      const newPackets = splitIntoPackets(data, blockSize);
      setPackets(newPackets);
      setTotalLength(data.length);
      setCurrentPacket(0);
      setTransmissionState('rts');
      setResponses([]);
      
      addToLog('info', `Starting transmission: ${data.length} bytes, ${newPackets.length} packets`);
      
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const sendRTS = () => {
    const rtsCommand = enableChecksum 
      ? `VT TP_RTS ${totalLength}, ${blockSize}, 1`
      : `VT TP_RTS ${totalLength}, ${blockSize}`;
    
    addToLog('command', rtsCommand);
    setTransmissionState('sending');
    
    // Simulate RTS response
    setTimeout(() => {
      addToLog('response', 'OK');
      sendNextPacket();
    }, 100);
  };

  const sendNextPacket = () => {
    if (currentPacket >= packets.length) {
      setTransmissionState('complete');
      addToLog('info', 'All packets sent, ready to end transmission');
      return;
    }

    const packet = packets[currentPacket];
    const dataHex = packet.data.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
    
    let command = `VT TP_DT ${packet.id.toString(16).toUpperCase().padStart(2, '0')} ${dataHex}`;
    
    if (enableChecksum && packet.checksum !== null) {
      command += ` ${packet.checksum.toString(16).toUpperCase().padStart(4, '0')}`;
    }
    
    addToLog('command', command);
    
    // Update packet status
    const updatedPackets = [...packets];
    updatedPackets[currentPacket] = {
      ...packet,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
    setPackets(updatedPackets);
    
    // Simulate packet response
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      if (success) {
        addToLog('response', 'OK');
        updatedPackets[currentPacket].status = 'confirmed';
        setPackets([...updatedPackets]);
        setCurrentPacket(prev => prev + 1);
        
        // Continue with next packet
        setTimeout(() => sendNextPacket(), 50);
      } else {
        addToLog('response', '?');
        updatedPackets[currentPacket].status = 'error';
        setPackets([...updatedPackets]);
        addToLog('error', `Packet ${currentPacket} failed, retransmission required`);
      }
    }, 100);
  };

  const retransmitPacket = (packetIndex) => {
    setCurrentPacket(packetIndex);
    const packet = packets[packetIndex];
    
    const updatedPackets = [...packets];
    updatedPackets[packetIndex] = { ...packet, status: 'pending' };
    setPackets(updatedPackets);
    
    addToLog('info', `Retransmitting packet ${packetIndex}`);
    sendNextPacket();
  };

  const endTransmission = () => {
    const endCommand = `VT TP_END`;
    addToLog('command', endCommand);
    
    // Simulate ECU response
    setTimeout(() => {
      const mockResponse = '640F1036E3044';
      addToLog('response', mockResponse);
      setResponses(prev => [...prev, {
        id: Date.now(),
        data: mockResponse,
        timestamp: new Date().toISOString()
      }]);
      setTransmissionState('idle');
      addToLog('success', 'Transmission completed successfully');
    }, 200);
  };

  const abortTransmission = () => {
    const abortCommand = 'VT TP_ABORT';
    addToLog('command', abortCommand);
    
    setTimeout(() => {
      addToLog('response', 'OK');
      setTransmissionState('idle');
      setPackets([]);
      setCurrentPacket(0);
      addToLog('warning', 'Transmission aborted');
    }, 100);
  };

  const addToLog = (type, message) => {
    const logEntry = {
      id: Date.now() + Math.random(),
      type,
      message,
      timestamp: new Date().toISOString()
    };
    setTransmissionLog(prev => [...prev, logEntry]);
  };

  const clearLog = () => {
    setTransmissionLog([]);
  };

  const exportLog = () => {
    const logText = transmissionLog.map(entry => 
      `[${new Date(entry.timestamp).toLocaleTimeString()}] ${entry.type.toUpperCase()}: ${entry.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mic3x2x_transmission_log.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSampleData = () => {
    // Generate sample programming data
    const sampleSize = 1500; // 1.5KB sample
    const sampleData = Array.from({length: sampleSize}, (_, i) => 
      (0x20 + (i % 96)).toString(16).padStart(2, '0')
    ).join('');
    setDataInput(sampleData);
  };

  const PacketCard = ({ packet, index, onRetransmit }) => {
    const statusColors = {
      pending: 'border-gray-300 bg-gray-50',
      sent: 'border-yellow-300 bg-yellow-50',
      confirmed: 'border-green-300 bg-green-50',
      error: 'border-red-300 bg-red-50'
    };

    const statusIcons = {
      pending: <Clock className="text-gray-500" size={16} />,
      sent: <Send className="text-yellow-600" size={16} />,
      confirmed: <CheckCircle className="text-green-600" size={16} />,
      error: <XCircle className="text-red-600" size={16} />
    };

    return (
      <div className={`border-2 rounded-lg p-3 ${statusColors[packet.status]}`}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            {statusIcons[packet.status]}
            <span className="font-semibold">Packet {index}</span>
          </div>
          {packet.status === 'error' && (
            <button
              onClick={() => onRetransmit(index)}
              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              Retry
            </button>
          )}
        </div>
        
        <div className="text-xs space-y-1">
          <div><span className="font-medium">Size:</span> {packet.data.length} bytes</div>
          {packet.checksum !== null && (
            <div><span className="font-medium">Checksum:</span> 0x{packet.checksum.toString(16).toUpperCase().padStart(4, '0')}</div>
          )}
          {packet.timestamp && (
            <div><span className="font-medium">Sent:</span> {new Date(packet.timestamp).toLocaleTimeString()}</div>
          )}
        </div>
        
        <div className="mt-2 p-2 bg-white rounded text-xs font-mono">
          {packet.data.slice(0, 8).map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')}
          {packet.data.length > 8 && '...'}
        </div>
      </div>
    );
  };

  const LogEntry = ({ entry }) => {
    const typeColors = {
      command: 'text-blue-600',
      response: 'text-green-600',
      error: 'text-red-600',
      warning: 'text-yellow-600',
      info: 'text-gray-600',
      success: 'text-green-700'
    };

    return (
      <div className={`text-sm font-mono ${typeColors[entry.type]}`}>
        <span className="text-gray-400 text-xs">
          [{new Date(entry.timestamp).toLocaleTimeString()}]
        </span>
        {' '}
        <span className="font-bold">{entry.type.toUpperCase()}:</span>
        {' '}
        {entry.message}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Package className="text-blue-600" size={28} />
            <h1 className="text-2xl font-bold text-gray-800">MIC3X2X Multi-Frame Handler</h1>
            <div className="text-sm text-gray-500">
              Enhanced 4,128-byte capacity
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={loadSampleData}
              className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              <Zap size={16} />
              <span>Load Sample</span>
            </button>
            
            <button
              onClick={exportLog}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              disabled={transmissionLog.length === 0}
            >
              <Download size={16} />
              <span>Export Log</span>
            </button>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Transmission Configuration</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Target Address</label>
                <input
                  type="text"
                  value={targetAddress}
                  onChange={(e) => setTargetAddress(e.target.value)}
                  className="w-full p-2 border rounded font-mono"
                  placeholder="6F1-01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Timeout (ms)</label>
                <input
                  type="number"
                  value={timeout}
                  onChange={(e) => setTimeout(parseInt(e.target.value))}
                  className="w-full p-2 border rounded"
                  min="100"
                  max="10000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Block Size (bytes)</label>
                <input
                  type="number"
                  value={blockSize}
                  onChange={(e) => setBlockSize(parseInt(e.target.value))}
                  className="w-full p-2 border rounded"
                  min="1"
                  max={MAX_BLOCK_SIZE}
                />
              </div>
              
              <div className="flex items-end">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enableChecksum}
                    onChange={(e) => setEnableChecksum(e.target.checked)}
                  />
                  <span className="text-sm">Enable Checksum</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Data (hex, max {MAX_TOTAL_LENGTH.toLocaleString()} bytes)
              </label>
              <textarea
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value.toUpperCase())}
                className="w-full p-2 border rounded font-mono text-xs"
                rows="4"
                placeholder="Enter hex data (space separated)"
                disabled={transmissionState !== 'idle'}
              />
              {dataInput && (
                <div className="text-xs text-gray-500 mt-1">
                  Length: {Math.floor(dataInput.replace(/\s+/g, '').length / 2)} bytes
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Transmission Status</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-blue-600 font-semibold">Total Length</div>
                <div className="text-2xl font-bold">{totalLength}</div>
                <div className="text-xs text-gray-600">bytes</div>
              </div>
              
              <div className="bg-purple-50 p-3 rounded">
                <div className="text-purple-600 font-semibold">Packets</div>
                <div className="text-2xl font-bold">{packets.length}</div>
                <div className="text-xs text-gray-600">total</div>
              </div>
              
              <div className="bg-green-50 p-3 rounded">
                <div className="text-green-600 font-semibold">Confirmed</div>
                <div className="text-2xl font-bold">
                  {packets.filter(p => p.status === 'confirmed').length}
                </div>
                <div className="text-xs text-gray-600">packets</div>
              </div>
              
              <div className="bg-red-50 p-3 rounded">
                <div className="text-red-600 font-semibold">Errors</div>
                <div className="text-2xl font-bold">
                  {packets.filter(p => p.status === 'error').length}
                </div>
                <div className="text-xs text-gray-600">packets</div>
              </div>
            </div>
            
            <div className="space-y-2">
              {transmissionState === 'idle' && (
                <button
                  onClick={startTransmission}
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                  disabled={!dataInput.trim()}
                >
                  Start Transmission
                </button>
              )}
              
              {transmissionState === 'rts' && (
                <button
                  onClick={sendRTS}
                  className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
                >
                  Send RTS
                </button>
              )}
              
              {transmissionState === 'complete' && (
                <button
                  onClick={endTransmission}
                  className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600"
                >
                  End Transmission
                </button>
              )}
              
              {(transmissionState === 'rts' || transmissionState === 'sending') && (
                <button
                  onClick={abortTransmission}
                  className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
                >
                  Abort Transmission
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Packet Status */}
        {packets.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3">Packet Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
              {packets.map((packet, index) => (
                <PacketCard
                  key={index}
                  packet={packet}
                  index={index}
                  onRetransmit={retransmitPacket}
                />
              ))}
            </div>
          </div>
        )}

        {/* Responses */}
        {responses.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3">ECU Responses</h3>
            <div className="space-y-2">
              {responses.map(response => (
                <div key={response.id} className="bg-green-50 border border-green-200 rounded p-3">
                  <div className="font-mono text-green-700">{response.data}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(response.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transmission Log */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">Transmission Log</h3>
            <button
              onClick={clearLog}
              className="flex items-center space-x-2 text-gray-500 hover:text-gray-700"
              disabled={transmissionLog.length === 0}
            >
              <Trash2 size={16} />
              <span>Clear</span>
            </button>
          </div>
          
          <div className="bg-gray-900 text-white p-4 rounded-lg h-64 overflow-y-auto">
            {transmissionLog.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                No transmission activity
              </div>
            ) : (
              <div className="space-y-1">
                {transmissionLog.map(entry => (
                  <LogEntry key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Command Reference */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-3">MIC3X2X Multi-Frame Commands</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-600 mb-2">TP Commands:</div>
              <div className="space-y-1 font-mono text-xs">
                <div>VT TP_RTS TotalLen, BlockSize[, EnChk]</div>
                <div>VT TP_DT ii hh...hh [chksum]</div>
                <div>VT TP_END [, maxResponses]</div>
                <div>VT TP_ABORT</div>
              </div>
            </div>
            <div>
              <div className="font-medium text-green-600 mb-2">Enhanced Features:</div>
              <div className="space-y-1 text-xs">
                <div>• Up to 4,128 bytes total data</div>
                <div>• Max 500 bytes per packet</div>
                <div>• Automatic checksum validation</div>
                <div>• Packet retry mechanism</div>
                <div>• Configurable addressing modes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MIC3X2XMultiFrameHandler;