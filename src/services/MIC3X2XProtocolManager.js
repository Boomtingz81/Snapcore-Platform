/**
 * MIC3X2X Protocol Manager
 * Comprehensive management class for MIC3X2X OBD to UART Interpreter
 * Based on MIC3X2X DS Ver2.3.08 datasheet
 */

class MIC3X2XProtocolManager {
    constructor(serialPort) {
        this.serialPort = serialPort;
        this.currentProtocol = null;
        this.protocolSettings = new Map();
        this.vtProtocols = new Map(); // Custom VT protocols (101-140)
        this.wmSequences = new Map(); // Wake/keep message sequences
        this.periodicMessages = new Map(); // Periodic messages (1-8)
        this.filterSettings = {
            passFilters: [],
            blockFilters: [],
            flowControlFilters: []
        };
        this.powerManagement = {
            sleepTriggers: {
                uart: false,
                obd: false,
                voltage: 0,
                ignition: false
            },
            wakeTriggers: {
                uart: false,
                obd: true,
                voltageDropDeep: 4.0,
                ignition: false
            }
        };
        this.deviceInfo = {
            version: 'MIC3X2X V2.3.08',
            serialNumber: '',
            macAddress: '',
            uniqueDeviceId: ''
        };
        
        // Initialize default protocols
        this.initializeProtocols();
    }

    /**
     * Initialize default protocol definitions
     */
    initializeProtocols() {
        // AT Protocol definitions (1-C)
        this.protocolSettings.set('1', { name: 'SAE J1850 PWM', type: 'J1850', speed: 41600 });
        this.protocolSettings.set('2', { name: 'SAE J1850 VPW', type: 'J1850', speed: 10400 });
        this.protocolSettings.set('3', { name: 'ISO 9141-2', type: 'ISO', speed: 10400 });
        this.protocolSettings.set('4', { name: 'ISO 14230-4 (KWP 5BAUD)', type: 'ISO', speed: 10400 });
        this.protocolSettings.set('5', { name: 'ISO 14230-4 (KWP FAST)', type: 'ISO', speed: 10400 });
        this.protocolSettings.set('6', { name: 'ISO 15765-4 (CAN 11/500)', type: 'CAN', speed: 500000, bits: 11 });
        this.protocolSettings.set('7', { name: 'ISO 15765-4 (CAN 29/500)', type: 'CAN', speed: 500000, bits: 29 });
        this.protocolSettings.set('8', { name: 'ISO 15765-4 (CAN 11/250)', type: 'CAN', speed: 250000, bits: 11 });
        this.protocolSettings.set('9', { name: 'ISO 15765-4 (CAN 29/250)', type: 'CAN', speed: 250000, bits: 29 });
        this.protocolSettings.set('A', { name: 'SAE J1939 (CAN 29/250)', type: 'J1939', speed: 250000, bits: 29 });
        this.protocolSettings.set('B', { name: 'USER1 CAN (11/125)', type: 'CAN', speed: 125000, bits: 11 });
        this.protocolSettings.set('C', { name: 'USER2 CAN (11/50)', type: 'CAN', speed: 50000, bits: 11 });

        // ST Protocol definitions (11-FF)
        this.protocolSettings.set('11', { name: 'SAE J1850 PWM', type: 'J1850', speed: 41600 });
        this.protocolSettings.set('12', { name: 'SAE J1850 VPW', type: 'J1850', speed: 10400 });
        this.protocolSettings.set('21', { name: 'ISO 9141 (no header)', type: 'ISO', speed: 10400 });
        this.protocolSettings.set('22', { name: 'ISO 9141-2 (5 baud)', type: 'ISO', speed: 10400 });
        this.protocolSettings.set('23', { name: 'ISO 14230 (no autoinit)', type: 'ISO', speed: 10400 });
        this.protocolSettings.set('33', { name: 'HS CAN (ISO 15765, 11-bit, 500K)', type: 'CAN', speed: 500000, bits: 11 });
        this.protocolSettings.set('53', { name: 'MS CAN (ISO 15765, 11-bit, 125K)', type: 'CAN', speed: 125000, bits: 11 });
        this.protocolSettings.set('63', { name: 'SW CAN (ISO 15765, 11-bit, 33.3K)', type: 'CAN', speed: 33300, bits: 11 });
        this.protocolSettings.set('C3', { name: 'CH CAN (ISO 15765, 11-bit, 500K)', type: 'CAN', speed: 500000, bits: 11 });
        this.protocolSettings.set('D3', { name: 'LS CAN (ISO 15765, 11-bit, 500K)', type: 'CAN', speed: 500000, bits: 11 });
    }

    /**
     * Send command to MIC3X2X and wait for response
     */
    async sendCommand(command, timeout = 5000) {
        return new Promise((resolve, reject) => {
            let response = '';
            const timer = setTimeout(() => {
                reject(new Error(`Command timeout: ${command}`));
            }, timeout);

            const dataHandler = (data) => {
                response += data.toString();
                if (response.includes('>') || response.includes('OK') || response.includes('ERROR')) {
                    clearTimeout(timer);
                    this.serialPort.removeListener('data', dataHandler);
                    resolve(response.trim());
                }
            };

            this.serialPort.on('data', dataHandler);
            this.serialPort.write(command + '\r');
        });
    }

    /**
     * AT Command Methods
     */
    
    // Reset and initialization
    async reset() {
        return await this.sendCommand('ATZ');
    }

    async warmStart() {
        return await this.sendCommand('ATWS');
    }

    async setDefaults() {
        return await this.sendCommand('ATD');
    }

    // Protocol selection and management
    async setProtocol(protocol) {
        const response = await this.sendCommand(`ATSP${protocol}`);
        if (response.includes('OK')) {
            this.currentProtocol = protocol;
        }
        return response;
    }

    async tryProtocol(protocol) {
        return await this.sendCommand(`ATTP${protocol}`);
    }

    async describeProtocol() {
        return await this.sendCommand('ATDP');
    }

    async describeProtocolNumber() {
        return await this.sendCommand('ATDPN');
    }

    // Header and addressing
    async setHeader(header) {
        return await this.sendCommand(`ATSH${header}`);
    }

    async setCANFilter(filter) {
        return await this.sendCommand(`ATCF${filter}`);
    }

    async setCANMask(mask) {
        return await this.sendCommand(`ATCM${mask}`);
    }

    async setCANReceiveAddress(address) {
        return await this.sendCommand(`ATCRA${address}`);
    }

    async setCANExtendedAddress(address) {
        return await this.sendCommand(`ATCEA${address}`);
    }

    async setCANExtendedReceive(address) {
        return await this.sendCommand(`ATCER${address}`);
    }

    // Flow control
    async setFlowControlMode(mode) {
        return await this.sendCommand(`ATFCSM${mode}`);
    }

    async setFlowControlHeader(header) {
        return await this.sendCommand(`ATFCSH${header}`);
    }

    async setFlowControlData(data) {
        return await this.sendCommand(`ATFCSD${data}`);
    }

    // Wake/keep messages
    async setWakeupMessage(data) {
        return await this.sendCommand(`ATWM${data}`);
    }

    async setWakeupHeader(header) {
        return await this.sendCommand(`ATWH${header}`);
    }

    async setWakeupTime(time) {
        return await this.sendCommand(`ATWT${time}`);
    }

    async setWakeupMode(mode) {
        return await this.sendCommand(`ATWM${mode}`);
    }

    /**
     * VT Command Methods (Enhanced functionality)
     */

    // Device information
    async getVTVersion() {
        return await this.sendCommand('VTVERS');
    }

    async getVTDeviceInfo() {
        return await this.sendCommand('VTI');
    }

    async getVTManufacturer() {
        return await this.sendCommand('VTPROI');
    }

    // Protocol management
    async setVTProtocol(protocol) {
        const response = await this.sendCommand(`VTP1${protocol}`);
        if (response.includes('OK')) {
            this.currentProtocol = protocol;
        }
        return response;
    }

    async setSTProtocol(protocol) {
        return await this.sendCommand(`VTP2${protocol}`);
    }

    async getCurrentProtocolNumber() {
        return await this.sendCommand('VTPRON');
    }

    async getCurrentProtocolDescription() {
        return await this.sendCommand('VTPROT');
    }

    // Custom protocol configuration
    async configureCANProtocol(protocol, option, baudrate, type, tm = null) {
        let command = `VTCFG_CAN ${protocol},${option},${baudrate},${type}`;
        if (tm !== null) {
            command += `,${tm}`;
        }
        const response = await this.sendCommand(command);
        if (response.includes('OK')) {
            this.vtProtocols.set(protocol, { option, baudrate, type, tm });
        }
        return response;
    }

    async configureISOProtocol(protocol, option, baudrate, iia = null) {
        let command = `VTCFG_ISO ${protocol},${option},${baudrate}`;
        if (iia !== null) {
            command += `,${iia}`;
        }
        const response = await this.sendCommand(command);
        if (response.includes('OK')) {
            this.vtProtocols.set(protocol, { option, baudrate, type: 'ISO', iia });
        }
        return response;
    }

    // Wake/keep message sequences
    async setCANWakeMessage(no, protocol, header, data, period, mode) {
        const command = `VTCAN_WM ${no},${protocol},${header},${data},${period},${mode}`;
        const response = await this.sendCommand(command);
        if (response.includes('OK')) {
            this.wmSequences.set(`CAN_${no}`, { protocol, header, data, period, mode });
        }
        return response;
    }

    async setISOWakeMessage(no, protocol, header, data, period, ctrl) {
        const command = `VTISO_WM ${no},${protocol},${header},${data},${period},${ctrl}`;
        const response = await this.sendCommand(command);
        if (response.includes('OK')) {
            this.wmSequences.set(`ISO_${no}`, { protocol, header, data, period, ctrl });
        }
        return response;
    }

    async deleteCANWakeMessage(no) {
        const response = await this.sendCommand(`VTDEL_CAN_WM ${no}`);
        if (response.includes('OK')) {
            this.wmSequences.delete(`CAN_${no}`);
        }
        return response;
    }

    async displayCANWakeMessage(no) {
        return await this.sendCommand(`VTDISP_CAN_WM ${no}`);
    }

    // Enhanced addressing and filtering
    async setFilterMask(filter, mask) {
        return await this.sendCommand(`VTSET_FM ${filter},${mask}`);
    }

    async setCANFlowControl(data, mode, header = null) {
        let command = `VTSET_CAN_FC ${data},${mode}`;
        if (header !== null) {
            command += `,${header}`;
        }
        return await this.sendCommand(command);
    }

    async setHeaderAndReceiver(header, receiver = null, timeout = null) {
        let command = `VTSET_HD ${header}`;
        if (receiver !== null) {
            command += `,${receiver}`;
            if (timeout !== null) {
                command += `,${timeout}`;
            }
        }
        return await this.sendCommand(command);
    }

    // Filtering functions
    async addBlockFilter(pattern, mask = null) {
        let command = `VTFBA ${pattern}`;
        if (mask !== null) {
            command += `,${mask}`;
        }
        const response = await this.sendCommand(command);
        if (response.includes('OK')) {
            this.filterSettings.blockFilters.push({ pattern, mask });
        }
        return response;
    }

    async clearBlockFilters() {
        const response = await this.sendCommand('VTFBA');
        if (response.includes('OK')) {
            this.filterSettings.blockFilters = [];
        }
        return response;
    }

    async addPassFilter(pattern, mask = null) {
        let command = `VTFPA ${pattern}`;
        if (mask !== null) {
            command += `,${mask}`;
        }
        const response = await this.sendCommand(command);
        if (response.includes('OK')) {
            this.filterSettings.passFilters.push({ pattern, mask });
        }
        return response;
    }

    async clearPassFilters() {
        const response = await this.sendCommand('VTFPA');
        if (response.includes('OK')) {
            this.filterSettings.passFilters = [];
        }
        return response;
    }

    // Monitoring
    async monitorBus(filter = null, mask = null) {
        let command = 'VTM';
        if (filter !== null) {
            command += ` ${filter}`;
            if (mask !== null) {
                command += `,${mask}`;
            }
        }
        return await this.sendCommand(command);
    }

    async monitorWithCurrentFilters() {
        return await this.sendCommand('VTMFCA');
    }

    async showBusActivity(canType = null) {
        let command = 'VTSHOW_BUS';
        if (canType !== null) {
            command += ` ${canType}`;
        }
        return await this.sendCommand(command);
    }

    // Periodic messaging
    async addPeriodicMessage(no, header, data, period, mode) {
        const command = `VTPMQE ${no},${header},${data},${period},${mode}`;
        const response = await this.sendCommand(command);
        if (response.includes('OK')) {
            this.periodicMessages.set(no, { header, data, period, mode });
        }
        return response;
    }

    async deletePeriodicMessage(no) {
        const response = await this.sendCommand(`VTPMQE ${no}`);
        if (response.includes('OK')) {
            this.periodicMessages.delete(no);
        }
        return response;
    }

    async printPeriodicMessage(no) {
        return await this.sendCommand(`VTPMQE_PRT ${no}`);
    }

    // Power management
    async setPowerDownVoltageThreshold(volts, timer) {
        const command = `VTPDVS ${volts},${timer}`;
        const response = await this.sendCommand(command);
        if (response.includes('OK')) {
            this.powerManagement.sleepTriggers.voltage = volts;
        }
        return response;
    }

    async setVoltageDropWakeup(volts, timer) {
        const command = `VTVDWK ${volts},${timer}`;
        const response = await this.sendCommand(command);
        if (response.includes('OK')) {
            this.powerManagement.wakeTriggers.voltageDropDeep = volts;
        }
        return response;
    }

    async setVoltageChangeWakeup(direction, volts, timer) {
        const command = `VTVLCW ${direction}${volts},${timer}`;
        return await this.sendCommand(command);
    }

    async readVoltage() {
        return await this.sendCommand('VTVLRD');
    }

    async getPowerManagementStatus() {
        return await this.sendCommand('VTPOWERMANAGE');
    }

    // EEPROM operations
    async writeEEPROM(position, data) {
        return await this.sendCommand(`VTWT_EE ${position},${data}`);
    }

    async readEEPROM(position, length) {
        return await this.sendCommand(`VTRD_EE ${position},${length}`);
    }

    // Device identification
    async setUniqueDeviceID(id) {
        const response = await this.sendCommand(`VTSET_UDS ${id}`);
        if (response.includes('OK')) {
            this.deviceInfo.uniqueDeviceId = id;
        }
        return response;
    }

    async readUniqueDeviceID() {
        return await this.sendCommand('VTRD_UDS');
    }

    async setMACAddress(macAddress) {
        const response = await this.sendCommand(`VTSET_MAC ${macAddress}`);
        if (response.includes('OK')) {
            this.deviceInfo.macAddress = macAddress;
        }
        return response;
    }

    async readMACAddress() {
        return await this.sendCommand('VTRD_MAC');
    }

    async readSerialNumber() {
        return await this.sendCommand('VTRDSN');
    }

    // Multi-packet transmission (TP)
    async startMultiPacketTransmission(totalLen, blockSize, enableChecksum = false) {
        let command = `VTTP_RTS ${totalLen},${blockSize}`;
        if (enableChecksum) {
            command += ',1';
        }
        return await this.sendCommand(command);
    }

    async sendDataPacket(packetNumber, data, checksum = null) {
        let command = `VTTP_DT ${packetNumber} ${data}`;
        if (checksum !== null) {
            command += ` ${checksum}`;
        }
        return await this.sendCommand(command);
    }

    async endMultiPacketTransmission(maxResponses = null) {
        let command = 'VTTP_END';
        if (maxResponses !== null) {
            command += `,${maxResponses}`;
        }
        return await this.sendCommand(command);
    }

    async abortMultiPacketTransmission() {
        return await this.sendCommand('VTTP_ABORT');
    }

    // Bluetooth management
    async setBTClassOfDevice(cod) {
        return await this.sendCommand(`VTBTMD COD ${cod}`);
    }

    async setBTDiscoveryMode(mode) {
        return await this.sendCommand(`VTBTMD DM ${mode}`);
    }

    async setBTDeviceName(name) {
        return await this.sendCommand(`VTBTMD DN ${name}`);
    }

    async setBTPIN(pin) {
        return await this.sendCommand(`VTBTMD PIN ${pin}`);
    }

    async getBTInfo() {
        return await this.sendCommand('VTBTMD I');
    }

    // Utility methods
    async getProtocolDetails() {
        const current = await this.getCurrentProtocolDescription();
        const number = await this.getCurrentProtocolNumber();
        return { current, number };
    }

    async getAllATProtocols() {
        return await this.sendCommand('VTAT_PROTOCOL_ALL');
    }

    async getAllSTProtocols() {
        return await this.sendCommand('VTST_PROTOCOL_ALL');
    }

    async getAllVTProtocols() {
        return await this.sendCommand('VTVT_PROTOCOL_ALL');
    }

    /**
     * High-level convenience methods
     */
    
    async initializeForVehicle(vehicleType = 'modern') {
        await this.reset();
        
        switch (vehicleType) {
            case 'modern':
                await this.setProtocol('6'); // ISO 15765-4 CAN 11/500
                break;
            case 'older':
                await this.setProtocol('3'); // ISO 9141-2
                break;
            case 'gm':
                await this.setProtocol('B'); // USER1 CAN
                break;
            case 'ford':
                await this.setProtocol('C'); // USER2 CAN
                break;
        }
        
        return await this.describeProtocol();
    }

    async sendOBDRequest(pid, mode = '01') {
        const command = mode + pid;
        return await this.sendCommand(command, 10000); // Longer timeout for OBD
    }

    async scanForProtocols() {
        const results = [];
        const protocols = ['6', '7', '8', '9', 'A', 'B', 'C'];
        
        for (const protocol of protocols) {
            try {
                const response = await this.tryProtocol(protocol);
                if (!response.includes('NO DATA') && !response.includes('ERROR')) {
                    results.push({
                        protocol,
                        name: this.protocolSettings.get(protocol)?.name || 'Unknown',
                        response
                    });
                }
            } catch (error) {
                // Protocol not supported or timeout
                console.log(`Protocol ${protocol} not supported:`, error.message);
            }
        }
        
        return results;
    }

    getStatus() {
        return {
            currentProtocol: this.currentProtocol,
            vtProtocols: Array.from(this.vtProtocols.entries()),
            wmSequences: Array.from(this.wmSequences.entries()),
            periodicMessages: Array.from(this.periodicMessages.entries()),
            filterSettings: this.filterSettings,
            powerManagement: this.powerManagement,
            deviceInfo: this.deviceInfo
        };
    }
}

// Example usage:
/*
const SerialPort = require('serialport');
const port = new SerialPort('/dev/ttyUSB0', { baudRate: 115200 });

const mic3x2x = new MIC3X2XProtocolManager(port);

// Initialize device
mic3x2x.initializeForVehicle('modern').then(protocol => {
    console.log('Initialized with protocol:', protocol);
    
    // Send OBD request
    return mic3x2x.sendOBDRequest('00'); // Get supported PIDs
}).then(response => {
    console.log('Supported PIDs:', response);
});

// Advanced configuration
mic3x2x.configureCANProtocol('101', '81', '01', 'HS_CAN').then(() => {
    return mic3x2x.setVTProtocol('101');
}).then(() => {
    console.log('Custom protocol configured and activated');
});
*/

module.exports = MIC3X2XProtocolManager;