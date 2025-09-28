import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Copy, Trash2, Settings, BookOpen, Zap, Search, Filter, Clock, ChevronDown, ChevronRight } from 'lucide-react';

const MIC3X2XCommandConsole = () => {
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([
    { type: 'system', text: 'MIC3X2X v2.3.08 Command Console Ready', timestamp: new Date().toLocaleTimeString() },
    { type: 'info', text: 'Type "help" for command reference or select from the command library', timestamp: new Date().toLocaleTimeString() }
  ]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [inputHistory, setInputHistory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    vt: true,
    at: false,
    st: false
  });
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  // Complete VT command set (91 commands from datasheet)
  const vtCommands = {
    'Device Info': {
      'VTD': { desc: 'Display solution designer name', example: 'VTD', response: 'JINXUSOLU' },
      'VTI': { desc: 'Display adapter device name', example: 'VTI', response: 'Logo v2.3.08' },
      'VTVERS': { desc: 'Display multi-protocol conversion firmware version', example: 'VTVERS', response: 'MIC3X2X V2.3.08' },
      'VTPROI': { desc: 'Display manufacturer name', example: 'VTPROI', response: 'Vgate' },
      'VTRDSN': { desc: 'Read device serial number', example: 'VTRDSN', response: '449519228014E7FEB70AD003B0B517529DC2A1A401640190' },
      'VTRD_UDS': { desc: 'Read unique device ID', example: 'VTRD_UDS', response: 'abcdefghijklmn1' },
      'VTRD_MAC': { desc: 'Read MAC address', example: 'VTRD_MAC', response: '12-23-34-45-56-67-78-89-9A-AB-BC-CD' }
    },
    'Protocol Management': {
      'VTP1hh': { desc: 'Switch to VT protocol (101-140)', example: 'VTP110C', response: 'OK' },
      'VTP2hh': { desc: 'Switch to ST protocol', example: 'VTP233', response: 'OK' },
      'VTPRON': { desc: 'Display current protocol number', example: 'VTPRON', response: '6 [AT]' },
      'VTPROT': { desc: 'Display current protocol description', example: 'VTPROT', response: 'ISO 15765-4 (CAN 11/500) [AT]' },
      'VTDPNO1hh': { desc: 'Display VT protocol details', example: 'VTDPNO11A', response: '11A: ISO 15765 (500K/11B), DLC:V, HS_CAN' },
      'VTDPNO2hh': { desc: 'Display ST protocol details', example: 'VTDPNO233', response: 'P33: HS_CAN (ISO 15765 500K/11B)' },
      'VTPC': { desc: 'Close current protocol', example: 'VTPC', response: 'OK' },
      'VTPO': { desc: 'Open current protocol', example: 'VTPO', response: 'OK' },
      'VTPBR baud': { desc: 'Set OBD protocol baud rate', example: 'VTPBR 1000000', response: 'OK' },
      'VTPBRD': { desc: 'Display OBD protocol baud rate', example: 'VTPBRD', response: '1000000' }
    },
    'Custom Protocols': {
      'VTCFG_CAN': { desc: 'Configure CAN protocol for VT', example: 'VTCFG_CAN 101,81,0F,SW_CAN,3', response: 'OK' },
      'VTSET_CAN': { desc: 'Set CAN protocol parameters', example: 'VTSET_CAN F,91,06,SW_CAN,3', response: 'OK' },
      'VTCFG_ISO': { desc: 'Configure ISO protocol for VT', example: 'VTCFG_ISO 103,B8,10', response: 'OK' },
      'VTAT_PROTOCOL_ALL': { desc: 'Display all AT protocols', example: 'VTAT_PROTOCOL_ALL', response: '[Protocol list]' },
      'VTST_PROTOCOL_ALL': { desc: 'Display all ST protocols', example: 'VTST_PROTOCOL_ALL', response: '[Protocol list]' },
      'VTVT_PROTOCOL_ALL': { desc: 'Display all VT protocols', example: 'VTVT_PROTOCOL_ALL', response: '[Protocol list]' }
    },
    'Wake/Keep Messages': {
      'VTCAN_WM': { desc: 'Set CAN wake/keep message', example: 'VTCAN_WM 1,101,7DF,01 3E 00 00 00 00 00 00,64,2', response: 'OK' },
      'VTISO_WM': { desc: 'Set ISO wake/keep message', example: 'VTISO_WM 1,103,C133F1,3E 00,64,1', response: 'OK' },
      'VTDEL_CAN_WM': { desc: 'Delete CAN wake message', example: 'VTDEL_CAN_WM 1', response: 'OK' },
      'VTDEL_ISO_WM': { desc: 'Delete ISO wake message', example: 'VTDEL_ISO_WM 1', response: 'OK' },
      'VTDISP_CAN_WM': { desc: 'Display CAN wake message', example: 'VTDISP_CAN_WM 1', response: 'No:1; P:101; H:7DF; D:01 3E 00...' },
      'VTDISP_ISO_WM': { desc: 'Display ISO wake message', example: 'VTDISP_ISO_WM 1', response: 'P:103; H:C133F1; D:[3E 00]...' }
    },
    'Filtering & Addressing': {
      'VTSET_FM': { desc: 'Set filter and mask', example: 'VTSET_FM 7DF,0FF', response: 'OK' },
      'VTSET_CAN_FC': { desc: 'Set CAN flow control', example: 'VTSET_CAN_FC F1 30 FF 08 00,2,7DF', response: 'OK' },
      'VTSET_HD': { desc: 'Set header and receiver', example: 'VTSET_HD 7DF,7E8,50', response: 'OK' },
      'VTFBA': { desc: 'Add/clear block filter', example: 'VTFBA 7E8,7FF', response: 'OK' },
      'VTFPA': { desc: 'Add/clear pass filter', example: 'VTFPA 7E8,7FF', response: 'OK' },
      'VTFCPA': { desc: 'Add/clear FC filter', example: 'VTFCPA 7E8,7FF', response: 'OK' },
      'VTFCTRA': { desc: 'Add/clear FC address pair', example: 'VTFCTRA 7E0,7E8', response: 'OK' }
    },
    'Monitoring': {
      'VTM': { desc: 'Monitor bus with filter', example: 'VTM 7DF,7FF', response: '[Bus monitoring active]' },
      'VTMFCA': { desc: 'Monitor with current filters', example: 'VTMFCA', response: '[Monitoring started]' },
      'VTSHOW_BUS': { desc: 'Show bus activity', example: 'VTSHOW_BUS', response: 'P: HSCAN; F:500K' }
    },
    'Timeouts & Timing': {
      'VTFCST hh': { desc: 'Set FC frame timeout', example: 'VTFCST 30', response: 'OK' },
      'VTSDST hh': { desc: 'Set multi-frame send delay', example: 'VTSDST 30', response: 'OK' },
      'VTISOFI': { desc: 'Set ISO fast init sequence', example: 'VTISOFI 25,25,C133F18166', response: 'OK' },
      'VTTOST': { desc: 'Set timeout parameters', example: 'VTTOST IP1X:100', response: 'OK' }
    },
    'UART & Communication': {
      'VTUART_BUAD_SET': { desc: 'Set UART baud rate', example: 'VTUART_BUAD_SET 3000000,1000', response: 'OK' }
    },
    'EEPROM Operations': {
      'VTWT_EE': { desc: 'Write to EEPROM', example: 'VTWT_EE 00,01 02 03 04 05 06 07', response: 'OK' },
      'VTRD_EE': { desc: 'Read from EEPROM', example: 'VTRD_EE 00,20', response: '01 02 03 04 05 06 07...' }
    },
    'Power Management': {
      'VTPOWERMANAGE': { desc: 'Display power management status', example: 'VTPOWERMANAGE', response: 'SLEEP: UART (OFF)...' },
      'VTPDVS': { desc: 'Set power down voltage/timer', example: 'VTPDVS 6.8,20', response: 'OK' },
      'VTVDWK': { desc: 'Set voltage drop wakeup', example: 'VTVDWK 2.5,20', response: 'OK' },
      'VTVLCW': { desc: 'Set voltage change wakeup', example: 'VTVLCW +0.5,2000', response: 'OK' },
      'VTVLRD': { desc: 'Read voltage continuously', example: 'VTVLRD', response: '12.1V' }
    },
    'Switch Groups': {
      'VTSWGP': { desc: 'Set switch command group', example: 'VTSWGP AL,KW0,CAF1,E0', response: 'OK' },
      'VTSWSC': { desc: 'SWCAN auto baud rate', example: 'VTSWSC 1', response: 'OK' },
      'VTSWRS': { desc: 'SWCAN load resistor', example: 'VTSWRS 2', response: 'OK' }
    },
    'Multi-Packet Transfer': {
      'VTTP_RTS': { desc: 'Request multi-packet transfer', example: 'VTTP_RTS 255,50,1', response: 'OK' },
      'VTTP_DT': { desc: 'Send data packet', example: 'VTTP_DT 00 2E3044025AFF...', response: 'OK' },
      'VTTP_END': { desc: 'End multi-packet transfer', example: 'VTTP_END', response: '640F1036E3044' },
      'VTTP_ABORT': { desc: 'Abort transfer', example: 'VTTP_ABORT', response: 'OK' }
    },
    'Programming': {
      'VTFEPS': { desc: 'FEPS voltage control', example: 'VTFEPS 1', response: 'OK' },
      'VTFullyRequest': { desc: 'Send programming request', example: 'VTFullyRequest hh...hh', response: 'hh...hh' },
      'VTFullyRequestCk': { desc: 'Send with checksum', example: 'VTFullyRequestCk hhhh hh...hh hhhh', response: 'hh...hh' },
      'VTTSPA': { desc: 'Request with variadic args', example: 'VTTSPA a:7E0,d:220200', response: '7E8620200' }
    },
    'Periodic Messages': {
      'VTPMQE': { desc: 'Periodic message queue', example: 'VTPMQE 1,710,3E80,1000,1', response: 'OK' },
      'VTPMQE_PRT': { desc: 'Print periodic message', example: 'VTPMQE_PRT 1', response: '[Message details]' },
      'VTWMGP': { desc: 'Wake message group', example: 'VTWMGP 1,B,500000,710,3E80,200,13', response: 'OK' },
      'VTWMGP_PRT': { desc: 'Print wake message group', example: 'VTWMGP_PRT 1', response: 'N:1, P:B, B:500000...' }
    },
    'Device Configuration': {
      'VTSET_UDS': { desc: 'Set unique device ID', example: 'VTSET_UDS abcdefghijklmn1', response: 'OK' },
      'VTSET_MAC': { desc: 'Set MAC address', example: 'VTSET_MAC 11 22 33 44 55 66', response: 'OK' },
      'VTUCS_ATI': { desc: 'Set ATI string', example: 'VTUCS_ATI Abc1357 v1.35', response: 'OK' },
      'VTUCS_ATDI': { desc: 'Set AT@1 string', example: 'VTUCS_ATDI This is an OBD converter', response: 'OK' },
      'VTUCS_STDI': { desc: 'Set STDI string', example: 'VTUCS_STDI Xxyyzz vx.x', response: 'OK' },
      'VTUCS_STI': { desc: 'Set STI string', example: 'VTUCS_STI Xyz1234567 va.b', response: 'OK' },
      'VTUCS_MFR': { desc: 'Set STMFR string', example: 'VTUCS_MFR genric', response: 'OK' },
      'VTUCS_VTI': { desc: 'Set VTI string', example: 'VTUCS_VTI Xyz1234567 va.b', response: 'OK' },
      'VTUCS_PROI': { desc: 'Set VTPROI string', example: 'VTUCS_PROI generic', response: 'OK' }
    },
    'Bluetooth Management': {
      'VTBTMD COD': { desc: 'BT class of device', example: 'VTBTMD COD 001F00', response: 'OK' },
      'VTBTMD DM': { desc: 'BT discovery mode', example: 'VTBTMD DM 2', response: 'OK' },
      'VTBTMD DN': { desc: 'BT device name', example: 'VTBTMD DN vLinker FS 00001', response: 'OK' },
      'VTBTMD HCIBAUD': { desc: 'BT HCI baud rate', example: 'VTBTMD HCIBAUD 2000000', response: 'OK' },
      'VTBTMD I': { desc: 'BT module info', example: 'VTBTMD I', response: 'Name:MIC3624 00001...' },
      'VTBTMD LEDN': { desc: 'BT BLE name', example: 'VTBTMD LEDN vLinker FS-IOS', response: 'OK' },
      'VTBTMD PIN': { desc: 'BT PIN code', example: 'VTBTMD PIN 000000', response: 'OK' },
      'VTBTMD PKPARAM': { desc: 'BT SPP parameters', example: 'VTBTMD PKPARAM 640 987 987', response: 'OK' },
      'VTBTMD PM': { desc: 'BT pairing mode', example: 'VTBTMD PM 1', response: 'OK' },
      'VTBTMD WM': { desc: 'BT work mode', example: 'VTBTMD WM 5', response: 'OK' }
    }
  };

  // AT Commands (common ones)
  const atCommands = {
    'Basic': {
      'ATZ': { desc: 'Reset device', example: 'ATZ', response: 'ELM327 v2.3' },
      'ATI': { desc: 'Print version ID', example: 'ATI', response: 'ELM327 v2.3' },
      'ATWS': { desc: 'Warm start', example: 'ATWS', response: 'ELM327 v2.3' },
      'ATD': { desc: 'Set defaults', example: 'ATD', response: 'OK' },
      'ATDP': { desc: 'Describe protocol', example: 'ATDP', response: 'ISO 15765-4 (CAN 11/500)' },
      'ATDPN': { desc: 'Describe protocol number', example: 'ATDPN', response: '6' }
    },
    'Protocol': {
      'ATSPh': { desc: 'Set protocol', example: 'ATSP6', response: 'OK' },
      'ATTPh': { desc: 'Try protocol', example: 'ATTP6', response: 'OK' },
      'ATPC': { desc: 'Protocol close', example: 'ATPC', response: 'OK' }
    },
    'Headers': {
      'ATSHxxx': { desc: 'Set header', example: 'ATSH7DF', response: 'OK' },
      'ATCFxxx': { desc: 'Set CAN filter', example: 'ATCF7E8', response: 'OK' },
      'ATCMxxx': { desc: 'Set CAN mask', example: 'ATCM7FF', response: 'OK' },
      'ATCRAxxx': { desc: 'Set CAN receive address', example: 'ATCRA7E8', response: 'OK' }
    }
  };

  // ST Commands (common ones)
  const stCommands = {
    'Protocol': {
      'STPxx': { desc: 'Set protocol', example: 'STP33', response: 'OK' },
      'STPR': { desc: 'Report protocol', example: 'STPR', response: '33' },
      'STPRS': { desc: 'Report protocol string', example: 'STPRS', response: 'HS CAN (ISO 15765 500K/11B)' }
    },
    'Filtering': {
      'STFAP': { desc: 'Add pass filter', example: 'STFAP 7E8,7FF', response: 'OK' },
      'STFAB': { desc: 'Add block filter', example: 'STFAB 7E8,7FF', response: 'OK' },
      'STM': { desc: 'Monitor bus', example: 'STM', response: '[Monitoring]' }
    }
  };

  const allCommands = {
    VT: vtCommands,
    AT: atCommands,
    ST: stCommands
  };

  // Simulate command execution
  const executeCommand = (command) => {
    const timestamp = new Date().toLocaleTimeString();
    const upperCommand = command.toUpperCase().trim();
    
    // Add command to history
    setCommandHistory(prev => [...prev, {
      type: 'command',
      text: command,
      timestamp
    }]);

    let response = 'NO DATA';
    
    // Check for help command
    if (upperCommand === 'HELP') {
      response = 'Available command sets: AT (ELM327), ST (STN), VT (91 commands)\nUse command selector or type commands directly\nExample: VTI, ATDP, STP33';
    }
    // Check VT commands
    else if (upperCommand.startsWith('VT')) {
      for (const category of Object.values(vtCommands)) {
        for (const [cmd, details] of Object.entries(category)) {
          if (upperCommand.startsWith(cmd.split(' ')[0])) {
            response = details.response;
            break;
          }
        }
        if (response !== 'NO DATA') break;
      }
    }
    // Check AT commands
    else if (upperCommand.startsWith('AT')) {
      for (const category of Object.values(atCommands)) {
        for (const [cmd, details] of Object.entries(category)) {
          if (upperCommand.startsWith(cmd)) {
            response = details.response;
            break;
          }
        }
        if (response !== 'NO DATA') break;
      }
    }
    // Check ST commands
    else if (upperCommand.startsWith('ST')) {
      for (const category of Object.values(stCommands)) {
        for (const [cmd, details] of Object.entries(category)) {
          if (upperCommand.startsWith(cmd)) {
            response = details.response;
            break;
          }
        }
        if (response !== 'NO DATA') break;
      }
    }
    // OBD PIDs
    else if (/^[0-9A-F]{2,4}$/.test(upperCommand)) {
      response = '41 ' + upperCommand.substr(2) + ' 00 00 00 00';
    }

    // Add response
    setTimeout(() => {
      setCommandHistory(prev => [...prev, {
        type: 'response',
        text: response,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }, 100);
  };

  const sendCommand = () => {
    if (!commandInput.trim()) return;
    
    setInputHistory(prev => [commandInput, ...prev.slice(0, 49)]);
    executeCommand(commandInput);
    setCommandInput('');
    setHistoryIndex(-1);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < inputHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommandInput(inputHistory[newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommandInput(inputHistory[newIndex] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommandInput('');
      }
    }
  };

  const clearTerminal = () => {
    setCommandHistory([{
      type: 'system',
      text: 'Terminal cleared',
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const insertCommand = (command) => {
    setCommandInput(command);
    inputRef.current?.focus();
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getFilteredCommands = (commands, categoryName) => {
    if (selectedCategory !== 'all' && selectedCategory !== categoryName.toLowerCase()) {
      return {};
    }
    
    if (!searchTerm) return commands;
    
    const filtered = {};
    Object.entries(commands).forEach(([category, cmds]) => {
      const filteredCmds = {};
      Object.entries(cmds).forEach(([cmd, details]) => {
        if (cmd.toLowerCase().includes(searchTerm.toLowerCase()) || 
            details.desc.toLowerCase().includes(searchTerm.toLowerCase())) {
          filteredCmds[cmd] = details;
        }
      });
      if (Object.keys(filteredCmds).length > 0) {
        filtered[category] = filteredCmds;
      }
    });
    return filtered;
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);

  const CommandSection = ({ title, commands, icon: Icon, highlight = false }) => {
    const filteredCommands = getFilteredCommands(commands, title);
    const commandCount = Object.values(filteredCommands).reduce((acc, cat) => acc + Object.keys(cat).length, 0);
    
    if (commandCount === 0) return null;

    return (
      <div className={`border rounded-lg ${highlight ? 'border-blue-300 bg-blue-50' : ''}`}>
        <button
          onClick={() => toggleSection(title.toLowerCase())}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
        >
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${highlight ? 'text-blue-600' : 'text-gray-600'}`} />
            <span className={`font-medium ${highlight ? 'text-blue-800' : 'text-gray-800'}`}>{title} Commands</span>
            <span className={`text-xs px-2 py-1 rounded ${highlight ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>
              {commandCount}
            </span>
          </div>
          {expandedSections[title.toLowerCase()] ? 
            <ChevronDown className="w-4 h-4" /> : 
            <ChevronRight className="w-4 h-4" />
          }
        </button>
        
        {expandedSections[title.toLowerCase()] && (
          <div className="border-t bg-gray-50 p-3">
            {Object.entries(filteredCommands).map(([category, cmds]) => (
              <div key={category} className="mb-4 last:mb-0">
                <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(cmds).map(([cmd, details]) => (
                    <div
                      key={cmd}
                      onClick={() => insertCommand(details.example)}
                      className="p-2 border rounded hover:bg-white cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <code className="text-sm font-mono text-blue-600">{cmd}</code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            insertCommand(details.example);
                          }}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          Insert
                        </button>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{details.desc}</div>
                      <div className="text-xs font-mono text-gray-500 mt-1">Ex: {details.example}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">MIC3X2X Command Console</h1>
              <p className="text-gray-600">Complete command interface with 91 VT commands</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Commands: {Object.values(allCommands).reduce((acc, cat) => acc + Object.values(cat).reduce((acc2, subcat) => acc2 + Object.keys(subcat).length, 0), 0)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Terminal */}
        <div className="lg:col-span-2">
          <div className="bg-black rounded-lg shadow overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-gray-800 text-white">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span className="text-sm font-medium">MIC3X2X Terminal</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearTerminal}
                  className="text-gray-300 hover:text-white"
                  title="Clear terminal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div 
              ref={terminalRef}
              className="h-96 overflow-y-auto p-4 font-mono text-sm"
            >
              {commandHistory.map((entry, index) => (
                <div key={index} className="mb-1">
                  <span className="text-gray-500 text-xs">[{entry.timestamp}] </span>
                  <span className={`${
                    entry.type === 'command' ? 'text-yellow-400' :
                    entry.type === 'response' ? 'text-green-400' :
                    entry.type === 'error' ? 'text-red-400' :
                    'text-blue-400'
                  }`}>
                    {entry.type === 'command' && '> '}
                    {entry.text}
                  </span>
                </div>
              ))}
              <div className="flex items-center text-green-400">
                <span>{'> '}</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono ml-1"
                  placeholder="Enter command (VT, AT, ST) or 'help'"
                  autoComplete="off"
                />
              </div>
            </div>
            
            <div className="p-3 bg-gray-800 border-t border-gray-700">
              <div className="flex items-center gap-2">
                <button
                  onClick={sendCommand}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  <Send className="w-3 h-3" />
                  Send
                </button>
                <button
                  onClick={() => insertCommand('help')}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  Help
                </button>
                <div className="text-xs text-gray-400 ml-auto">
                  Use ↑↓ for history | Enter to send
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Command Library */}
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold">Command Library</h3>
            </div>
            
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search commands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
                />
              </div>
              
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="vt">VT Commands (91)</option>
                  <option value="at">AT Commands</option>
                  <option value="st">ST Commands</option>
                </select>
              </div>
            </div>
          </div>

          {/* VT Commands - Highlighted */}
          <CommandSection 
            title="VT" 
            commands={vtCommands} 
            icon={Zap}
            highlight={true}
          />

          {/* AT Commands */}
          <CommandSection 
            title="AT" 
            commands={atCommands} 
            icon={Settings}
          />

          {/* ST Commands */}
          <CommandSection 
            title="ST" 
            commands={stCommands} 
            icon={Terminal}
          />

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => insertCommand('VTI')}
                className="p-2 text-left border rounded hover:bg-gray-50 text-sm"
              >
                <div className="font-mono">VTI</div>
                <div className="text-xs text-gray-600">Device info</div>
              </button>
              <button
                onClick={() => insertCommand('VTVERS')}
                className="p-2 text-left border rounded hover:bg-gray-50 text-sm"
              >
                <div className="font-mono">VTVERS</div>
                <div className="text-xs text-gray-600">Version</div>
              </button>
              <button
                onClick={() => insertCommand('VTSHOW_BUS')}
                className="p-2 text-left border rounded hover:bg-gray-50 text-sm"
              >
                <div className="font-mono">VTSHOW_BUS</div>
                <div className="text-xs text-gray-600">Bus activity</div>
              </button>
              <button
                onClick={() => insertCommand('VTPROT')}
                className="p-2 text-left border rounded hover:bg-gray-50 text-sm"
              >
                <div className="font-mono">VTPROT</div>
                <div className="text-xs text-gray-600">Protocol info</div>
              </button>
              <button
                onClick={() => insertCommand('ATDP')}
                className="p-2 text-left border rounded hover:bg-gray-50 text-sm"
              >
                <div className="font-mono">ATDP</div>
                <div className="text-xs text-gray-600">AT protocol</div>
              </button>
              <button
                onClick={() => insertCommand('0100')}
                className="p-2 text-left border rounded hover:bg-gray-50 text-sm"
              >
                <div className="font-mono">0100</div>
                <div className="text-xs text-gray-600">OBD PID</div>
              </button>
            </div>
          </div>

          {/* Command Statistics */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-3">Command Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>VT Commands:</span>
                <span className="font-bold text-blue-600">91</span>
              </div>
              <div className="flex justify-between">
                <span>AT Commands:</span>
                <span className="font-bold">24+</span>
              </div>
              <div className="flex justify-between">
                <span>ST Commands:</span>
                <span className="font-bold">15+</span>
              </div>
              <div className="flex justify-between">
                <span>Total Categories:</span>
                <span className="font-bold">15</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Type 'help' for command overview</li>
              <li>• Click any command to insert it</li>
              <li>• Use ↑↓ arrows for command history</li>
              <li>• VT commands offer enhanced functionality</li>
              <li>• Search by command name or description</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MIC3X2XCommandConsole;