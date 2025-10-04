import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Code, Shield, Cpu, Radio, Zap, AlertTriangle } from 'lucide-react';

const SolarTrackerArchitecture = () => {
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedTechniques, setExpandedTechniques] = useState({});

  const toggleModule = (id) => {
    setExpandedModules(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleTechnique = (id) => {
    setExpandedTechniques(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const Keyword = ({ children, color = "blue" }) => {
    const colors = {
      blue: "text-blue-400",
      purple: "text-purple-400",
      green: "text-green-400",
      orange: "text-orange-400",
      red: "text-red-400",
      yellow: "text-yellow-400"
    };
    return <span className={`${colors[color]} font-semibold`}>[[{children}]]</span>;
  };

  const modules = [
    {
      id: 'main',
      name: 'Main Control Loop',
      icon: Cpu,
      color: 'blue',
      tagline: 'System orchestrator with deterministic execution',
      responsibilities: [
        'System initialization and power-on self-test (POST)',
        'Watchdog timer management - reset every 100ms cycle',
        'Module orchestration at fixed 100ms intervals',
        'Critical failure detection and safe mode entry'
      ],
      interfaces: ['All modules via direct function calls'],
      safetyFeatures: [
        'Independent hardware watchdog timer',
        'Stack canary for overflow detection',
        'Execution time monitoring per cycle'
      ]
    },
    {
      id: 'sensor',
      name: 'Sensor Management',
      icon: Radio,
      color: 'green',
      tagline: 'Light detection with radiation-tolerant filtering',
      responsibilities: [
        'Read 4× photoresistors via analog pins A0-A3',
        'Apply 3-sample median filter for transient rejection',
        'Calculate quadrant differential for sun vector',
        'Detect sensor faults (stuck values, out-of-range)',
        'Provide sun position error (delta-azimuth, delta-elevation)'
      ],
      interfaces: [
        'Input: Analog pins A0-A3',
        'Output: sun_position_t structure to Tracking Module'
      ],
      safetyFeatures: [
        'Triple-redundant reading with majority vote',
        'Temporal median filter rejects SETs',
        'Fault counters track persistent sensor failures'
      ]
    },
    {
      id: 'tracking',
      name: 'Tracking Algorithm',
      icon: Zap,
      color: 'purple',
      tagline: 'Proportional controller with dead-band compensation',
      responsibilities: [
        'Implement proportional control law (Kp = 0.8)',
        'Apply 2 degree dead-band to prevent servo jitter',
        'Generate servo position commands',
        'Detect sun-loss condition (low signal on all sensors)',
        'Return to default position on timeout'
      ],
      interfaces: [
        'Input: Sun position errors from Sensor Module',
        'Output: Target positions (azimuth°, elevation°) to Servo Driver'
      ],
      safetyFeatures: [
        'Hard position limits: 30-150 deg elevation, 0-180 deg azimuth',
        'Rate limiting: max 20 deg/sec to prevent mechanical shock',
        '5-second timeout triggers fail-safe return'
      ]
    },
    {
      id: 'servo',
      name: 'Servo Driver',
      icon: Code,
      color: 'orange',
      tagline: 'PWM generation with write-verify protection',
      responsibilities: [
        'Generate PWM signals for 3× servo motors (D9, D10, D11)',
        'Position verification via feedback reading',
        'Servo current monitoring and timeout detection',
        'Safe position enforcement on communication failure',
        'Calibration and homing sequence on startup'
      ],
      interfaces: [
        'Input: servo_cmd_t from Tracking Module',
        'Output: PWM signals with 1-2ms pulse width'
      ],
      safetyFeatures: [
        'Write-verify cycle: read back position after command',
        'Watchdog per servo: detect frozen servos',
        'Graceful degradation with 2/3 servos operational'
      ]
    },
    {
      id: 'telemetry',
      name: 'Telemetry & Diagnostics',
      icon: Radio,
      color: 'blue',
      tagline: 'Health monitoring and event logging',
      responsibilities: [
        'Serial output at 9600 baud for ground station',
        'Health status reporting (uptime, error counts, mode)',
        'Performance metrics (tracking RMS error, power draw)',
        'Event logging with timestamps',
        'LED heartbeat on pin D13'
      ],
      interfaces: [
        'Input: Status structures from all modules',
        'Output: Serial UART TX, LED indicator'
      ],
      safetyFeatures: [
        'Non-blocking writes only - never stalls control loop',
        'Circular buffer prevents memory overflow'
      ]
    },
    {
      id: 'safety',
      name: 'Safety & Fault Management',
      icon: Shield,
      color: 'red',
      tagline: 'Centralized error handling and recovery',
      responsibilities: [
        'Centralized error logging with severity levels',
        'Failure classification (transient vs. persistent)',
        'Safe mode state machine: NORMAL, DEGRADED, SAFE, EMERGENCY',
        'Memory integrity checking with CRC-16',
        'TMR variable validation and correction'
      ],
      interfaces: [
        'Input: Fault reports from all modules',
        'Output: system_mode_t to all modules'
      ],
      safetyFeatures: [
        'Triple-modular redundancy for critical state',
        'EEPROM wear leveling for persistent counters',
        'Automatic recovery with exponential backoff'
      ]
    },
    {
      id: 'power',
      name: 'Power Management',
      icon: Zap,
      color: 'yellow',
      tagline: 'Battery monitoring and load shedding',
      responsibilities: [
        'Battery voltage monitoring via A4 (voltage divider)',
        'State of charge estimation',
        'Low-power mode at <20% charge',
        'Servo duty cycle reduction under low battery',
        'Critical shutdown sequence at <10%'
      ],
      interfaces: [
        'Input: Battery voltage from A4',
        'Output: power_state_t to all modules'
      ],
      safetyFeatures: [
        'Hysteresis prevents mode oscillation',
        'Graceful shutdown preserves EEPROM state'
      ]
    }
  ];

  const radiationTechniques = [
    {
      id: 'tmr',
      name: 'Triple Modular Redundancy',
      threat: 'SEU - Single Event Upset',
      description: 'Critical variables stored in triplicate. Majority voting corrects single-bit flips.',
      location: 'Safety Module, critical state variables',
      code: `struct TMR_State {
  int16_t value[3];
  
  int16_t vote() {
    // 2-of-3 majority voter
    return (value[0] == value[1]) ? value[0] :
           (value[0] == value[2]) ? value[0] : value[1];
  }
  
  void write(int16_t v) {
    value[0] = value[1] = value[2] = v;
  }
  
  bool validate() {
    return (value[0] == value[1]) || 
           (value[1] == value[2]) || 
           (value[0] == value[2]);
  }
};`
    },
    {
      id: 'scrubbing',
      name: 'Memory Scrubbing',
      threat: 'MBU - Multiple Bit Upsets',
      description: 'Periodic CRC validation and correction prevents bit-flip accumulation over mission duration.',
      location: 'Safety Module - 500ms background task',
      code: `void scrub_memory_block() {
  static uint8_t block = 0;
  
  uint16_t computed = crc16(&critical_data[block * BLOCK_SIZE], 
                             BLOCK_SIZE);
  
  if (computed != stored_crc[block]) {
    // Corruption detected - restore from backup
    restore_from_backup(block);
    error_count[ERR_MEMORY]++;
  }
  
  block = (block + 1) % NUM_BLOCKS;
}`
    },
    {
      id: 'crc',
      name: 'CRC Error Detection',
      threat: 'Data corruption in transit',
      description: 'All inter-module data transfers include CRC-16 for integrity verification.',
      location: 'All module interfaces',
      code: `typedef struct __attribute__((packed)) {
  uint16_t azimuth;
  uint16_t elevation;
  uint16_t crc16;
} servo_cmd_t;

bool send_servo_cmd(servo_cmd_t* cmd) {
  cmd->crc16 = crc16_calc(cmd, offsetof(servo_cmd_t, crc16));
  
  // Send command
  return servo_driver_execute(cmd);
}

bool validate_cmd(servo_cmd_t* cmd) {
  uint16_t computed = crc16_calc(cmd, offsetof(servo_cmd_t, crc16));
  return computed == cmd->crc16;
}`
    },
    {
      id: 'median',
      name: 'Temporal Median Filter',
      threat: 'SET - Single Event Transient',
      description: 'Multi-sample median rejects transient voltage spikes from particle strikes.',
      location: 'Sensor Module - all ADC readings',
      code: `uint16_t median_filter_3(uint16_t* samples) {
  // Optimized 3-sample median (no sort needed)
  uint16_t a = samples[0], b = samples[1], c = samples[2];
  
  if (a > b) {
    if (b > c) return b;      // a > b > c
    else if (a > c) return c; // a > c > b
    else return a;            // c > a > b
  } else {
    if (a > c) return a;      // b > a > c
    else if (b > c) return c; // b > c > a
    else return b;            // c > b > a
  }
}`
    },
    {
      id: 'writeverify',
      name: 'Write-Verify Cycles',
      threat: 'Write operation failures',
      description: 'Every critical write followed by read-back verification with retry logic.',
      location: 'Servo Driver, EEPROM operations',
      code: `bool safe_servo_write(uint8_t pin, uint16_t pos) {
  const uint8_t MAX_RETRIES = 3;
  
  for (uint8_t attempt = 0; attempt < MAX_RETRIES; attempt++) {
    servo.write(pin, pos);
    delay_us(200); // Allow servo to settle
    
    uint16_t readback = servo.read(pin);
    
    if (abs((int16_t)readback - (int16_t)pos) <= TOLERANCE) {
      return true; // Success
    }
  }
  
  fault_handler(ERR_SERVO_WRITE_FAIL);
  return false;
}`
    },
    {
      id: 'controlflow',
      name: 'Control Flow Checking',
      threat: 'SEFI - Single Event Functional Interrupt',
      description: 'Signature-based verification ensures code executes in correct sequence.',
      location: 'Main Control Loop',
      code: `#define SIG_INIT    0xA5A5
#define SIG_SENSOR  0x3C3C
#define SIG_TRACK   0x5A5A
#define SIG_SERVO   0xC3C3

uint16_t flow_signature = 0;

void main_control_loop() {
  flow_signature = SIG_INIT;
  
  read_sensors();
  flow_signature ^= SIG_SENSOR;
  
  compute_tracking();
  flow_signature ^= SIG_TRACK;
  
  update_servos();
  flow_signature ^= SIG_SERVO;
  
  // Verify execution path
  if (flow_signature != EXPECTED_SIGNATURE) {
    system_fault(ERR_CONTROL_FLOW_CORRUPTION);
  }
}`
    },
    {
      id: 'watchdog',
      name: 'Windowed Watchdog Timer',
      threat: 'Hung code & timing violations',
      description: 'Advanced watchdog catches both stuck code AND code running too fast.',
      location: 'Main Control Loop',
      code: `#define WDT_MIN_WINDOW  80  // ms
#define WDT_MAX_WINDOW  120 // ms

void feed_watchdog() {
  uint32_t elapsed = millis() - last_feed;
  
  if (elapsed < WDT_MIN_WINDOW) {
    // Code running too fast - possible corruption
    return; // Don't feed, will trigger reset
  }
  
  if (elapsed > WDT_MAX_WINDOW) {
    // Already too late - will reset
  }
  
  wdt_reset();
  last_feed = millis();
}`
    },
    {
      id: 'rangecheck',
      name: 'Range Checking',
      threat: 'Corrupted data propagation',
      description: 'Comprehensive bounds validation at all module interfaces.',
      location: 'All module boundaries',
      code: `#define VALIDATE_RANGE(val, min, max, err_code) \\
  do { \\
    if ((val) < (min) || (val) > (max)) { \\
      error_count[err_code]++; \\
      return false; \\
    } \\
  } while(0)

bool set_servo_position(int16_t deg) {
  VALIDATE_RANGE(deg, 30, 150, ERR_SERVO_RANGE);
  
  // Proceed with validated value
  return servo_driver_set(deg);
}`
    },
    {
      id: 'degradation',
      name: 'Graceful Degradation',
      threat: 'Cascading failures',
      description: 'Multi-level operational modes maintain mission capability with partial failures.',
      location: 'Safety Module state machine',
      code: `typedef enum {
  MODE_NORMAL,      // All systems nominal
  MODE_DEGRADED_1,  // 3/4 sensors operational
  MODE_DEGRADED_2,  // 2/3 servos operational
  MODE_SAFE,        // Return to default position
  MODE_EMERGENCY    // Minimum power, await recovery
} system_mode_t;

void evaluate_system_mode() {
  if (error_count[ERR_CRITICAL] > 0) {
    set_mode(MODE_EMERGENCY);
  } else if (servo_fault_count >= 1) {
    set_mode(MODE_DEGRADED_2);
  } else if (sensor_fault_count >= 1) {
    set_mode(MODE_DEGRADED_1);
  } else {
    set_mode(MODE_NORMAL);
  }
}`
    },
    {
      id: 'diversity',
      name: 'Diverse Redundancy',
      threat: 'Common-mode failures',
      description: 'Multiple independent methods for critical measurements avoid systematic errors.',
      location: 'Sensor & Tracking Modules',
      code: `typedef struct {
  // Method 1: Photoresistor differential
  int16_t photo_azimuth;
  int16_t photo_elevation;
  
  // Method 2: Time-based solar ephemeris
  int16_t predicted_azimuth;
  int16_t predicted_elevation;
  
  // Method 3: Last known good position + dead reckoning
  int16_t last_known_azimuth;
  int16_t last_known_elevation;
  
  uint8_t confidence[3]; // Confidence per method
} sun_position_t;`
    }
  ];

  const constants = [
    { name: 'CONTROL_PERIOD', value: '100 ms', desc: 'Main loop execution interval' },
    { name: 'WATCHDOG_TIMEOUT', value: '2000 ms', desc: 'System reset if watchdog not fed' },
    { name: 'SENSOR_SAMPLES', value: '3', desc: 'Median filter window size' },
    { name: 'DEADBAND', value: '2.0 degrees', desc: 'Tracking threshold to prevent jitter' },
    { name: 'SUN_LOSS_TIMEOUT', value: '5000 ms', desc: 'Time before safe mode entry' },
    { name: 'DEFAULT_POSITION', value: '(90°, 60°)', desc: 'Fail-safe orientation' },
    { name: 'MAX_ERROR_COUNT', value: '10', desc: 'Persistent faults trigger safe mode' },
    { name: 'SCRUB_INTERVAL', value: '500 ms', desc: 'Memory validation period' },
    { name: 'TMR_VOTE_THRESHOLD', value: '2/3', desc: 'Majority for TMR correction' }
  ];

  const colorMap = {
    blue: 'border-blue-500/30 bg-slate-800/50 hover:border-blue-500/60',
    green: 'border-green-500/30 bg-slate-800/50 hover:border-green-500/60',
    purple: 'border-purple-500/30 bg-slate-800/50 hover:border-purple-500/60',
    orange: 'border-orange-500/30 bg-slate-800/50 hover:border-orange-500/60',
    red: 'border-red-500/30 bg-slate-800/50 hover:border-red-500/60',
    yellow: 'border-yellow-500/30 bg-slate-800/50 hover:border-yellow-500/60'
  };

  const iconColorMap = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400'
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-100 p-6 overflow-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-block bg-slate-800/50 backdrop-blur border border-blue-500/30 rounded-lg px-6 py-8">
            <h1 className="text-4xl font-light mb-3">
              Lunar Solar Tracker
            </h1>
            <div className="text-lg text-gray-400 font-light mb-2">
              Radiation-Tolerant Firmware Architecture
            </div>
            <div className="text-sm text-gray-500">
              Safety-Critical Embedded System • Arduino Platform • C Language
            </div>
          </div>
        </div>

        {/* Problem Statement */}
        <div className="mb-8 bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur border-2 border-blue-500/40 rounded-lg p-8">
          <div className="flex items-start gap-4 mb-6">
            <AlertTriangle className="w-8 h-8 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-light mb-2 text-blue-200">Problem Statement</h2>
              <p className="text-sm text-gray-400 font-light">Artemis Lunar Surface Power Generation Challenge</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Mission Context */}
            <div>
              <h3 className="text-lg font-medium text-blue-300 mb-3">The Challenge</h3>
              <p className="text-gray-300 leading-relaxed">
                The Artemis program will establish human presence on the lunar surface, requiring <Keyword color="orange">reliable power infrastructure</Keyword> for 
                operations. Solar power is ideal, but the lunar environment creates a unique tracking challenge: depending on landing location, 
                the sun moves rapidly across the sky, <strong className="text-blue-400">severely reducing efficiency</strong> of fixed solar arrays.
              </p>
            </div>

            {/* Technical Challenges */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-5">
              <h3 className="text-lg font-medium text-red-300 mb-4">Environmental Challenges</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-semibold text-red-400 mb-2">Radiation Environment</div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li className="flex gap-2"><span className="text-red-500">•</span>No atmospheric shielding from cosmic radiation</li>
                    <li className="flex gap-2"><span className="text-red-500">•</span>Electronics vulnerable to bit flips and transients</li>
                    <li className="flex gap-2"><span className="text-red-500">•</span>Standard microcontrollers not designed for this environment</li>
                    <li className="flex gap-2"><span className="text-red-500">•</span>Must handle faults gracefully without human intervention</li>
                  </ul>
                </div>
                <div>
                  <div className="text-sm font-semibold text-orange-400 mb-2">Operational Constraints</div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li className="flex gap-2"><span className="text-orange-500">•</span>Sun moves rapidly across the lunar sky</li>
                    <li className="flex gap-2"><span className="text-orange-500">•</span>No manual servicing capability</li>
                    <li className="flex gap-2"><span className="text-orange-500">•</span>Must operate autonomously and reliably</li>
                    <li className="flex gap-2"><span className="text-orange-500">•</span>Power generation is mission-critical</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* The Core Problem */}
            <div className="bg-slate-900/70 border-l-4 border-yellow-500 p-5">
              <h3 className="text-lg font-medium text-yellow-300 mb-3">Design Question</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                <strong className="text-yellow-400">How can we build a solar tracker using commercial Arduino hardware that implements 
                radiation-tolerant design principles to demonstrate fault-resilient autonomous operation?</strong>
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                While we're using commercial hardware for this proof-of-concept, the firmware architecture applies 
                <Keyword color="blue">industry-standard radiation hardening techniques</Keyword> that are used in actual spaceflight systems. 
                This demonstrates how software-based fault tolerance can complement hardware when radiation-hardened components aren't available.
              </p>
            </div>

            {/* Requirements from Challenge */}
            <div>
              <h3 className="text-lg font-medium text-green-300 mb-3">Challenge Requirements</h3>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="bg-slate-900/50 border border-green-700/50 rounded p-4">
                  <div className="text-sm font-semibold text-green-400 mb-2">Physical</div>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>• Fit within 300mm³ cube</li>
                    <li>• Use only provided materials</li>
                    <li>• Track sun &gt;30° above horizon</li>
                    <li>• Full range of motion</li>
                  </ul>
                </div>
                <div className="bg-slate-900/50 border border-blue-700/50 rounded p-4">
                  <div className="text-sm font-semibold text-blue-400 mb-2">Functional</div>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>• Autonomous sun tracking</li>
                    <li>• Follow moving light source</li>
                    <li>• Maximize energy capture</li>
                    <li>• Demonstrate in dark room</li>
                  </ul>
                </div>
                <div className="bg-slate-900/50 border border-red-700/50 rounded p-4">
                  <div className="text-sm font-semibold text-red-400 mb-2">Safety</div>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>• Return to default position if sun lost</li>
                    <li>• Fail-safe operation</li>
                    <li>• No runaway conditions</li>
                    <li>• Predictable behavior</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Our Approach */}
            <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/40 rounded-lg p-5">
              <h3 className="text-lg font-medium text-green-300 mb-3">Our Approach</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                This architecture demonstrates <strong className="text-green-400">radiation-tolerant embedded design</strong> using 
                an Arduino platform. While the hardware itself isn't space-qualified, the <Keyword color="blue">software architecture</Keyword> implements 
                proven fault mitigation techniques: <Keyword color="purple">Triple Modular Redundancy</Keyword>, 
                <Keyword color="orange">memory validation</Keyword>, <Keyword color="red">temporal filtering</Keyword>, and 
                <Keyword color="yellow">graceful degradation</Keyword>.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-900/50 border border-slate-700/50 rounded p-3">
                  <div className="text-blue-400 font-semibold mb-1">Educational Value</div>
                  <div className="text-gray-400">Demonstrates real spaceflight fault-tolerance techniques in an accessible, 
                  hackathon-appropriate implementation</div>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/50 rounded p-3">
                  <div className="text-green-400 font-semibold mb-1">Future Path</div>
                  <div className="text-gray-400">Proof-of-concept architecture that could be adapted for radiation-hardened 
                  hardware in actual flight systems</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture Overview */}
        <div className="mb-8 bg-slate-800/30 backdrop-blur border border-purple-500/30 rounded-lg p-6">
          <h2 className="text-xl font-light mb-4 text-purple-300">Architecture Overview</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            The firmware employs a <Keyword color="blue">modular</Keyword>, <Keyword color="green">defense-in-depth</Keyword> approach 
            with seven independent subsystems. Each module implements fault detection and recovery capabilities, demonstrating 
            how embedded systems can be designed to handle <Keyword color="red">unexpected failures</Keyword> while 
            maintaining <Keyword color="orange">safe operation</Keyword> and <Keyword color="purple">reliable tracking performance</Keyword>.
          </p>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-900/50 border border-slate-700/50 rounded p-3">
              <div className="text-blue-400 font-semibold mb-1">Design Philosophy</div>
              <div className="text-gray-400">Fail-safe defaults • Bounded execution • Redundant verification</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-700/50 rounded p-3">
              <div className="text-green-400 font-semibold mb-1">Fault Mitigation</div>
              <div className="text-gray-400">TMR • Memory scrubbing • Temporal filtering • CRC validation</div>
            </div>
          </div>
        </div>

        {/* System Modules */}
        <div className="mb-8">
          <h2 className="text-2xl font-light mb-6 text-gray-300">System Modules</h2>
          <div className="space-y-3">
            {modules.map(module => {
              const IconComponent = module.icon;
              return (
                <div 
                  key={module.id} 
                  className={`border rounded-lg transition-all duration-200 ${colorMap[module.color]}`}
                >
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => toggleModule(module.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <IconComponent className={`w-5 h-5 mt-0.5 ${iconColorMap[module.color]}`} />
                        <div className="flex-1">
                          <h3 className="text-lg font-medium mb-1">{module.name}</h3>
                          <p className="text-sm text-gray-400 font-light">{module.tagline}</p>
                        </div>
                      </div>
                      {expandedModules[module.id] ? 
                        <ChevronDown className="w-5 h-5 text-gray-500" /> : 
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      }
                    </div>
                  </div>
                  
                  {expandedModules[module.id] && (
                    <div className="px-4 pb-4 space-y-4 border-t border-slate-700/50">
                      <div className="pt-4">
                        <div className="text-sm font-semibold text-yellow-400/80 mb-2">Responsibilities</div>
                        <ul className="space-y-1.5 text-sm text-gray-300">
                          {module.responsibilities.map((resp, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-gray-600">→</span>
                              <span>{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <div className="text-sm font-semibold text-blue-400/80 mb-2">Interfaces</div>
                        <ul className="space-y-1.5 text-sm text-gray-300 font-mono">
                          {module.interfaces.map((intf, i) => (
                            <li key={i} className="text-gray-400">{intf}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <div className="text-sm font-semibold text-red-400/80 mb-2">Safety Features</div>
                        <ul className="space-y-1.5 text-sm text-gray-300">
                          {module.safetyFeatures.map((feat, i) => (
                            <li key={i} className="flex gap-2">
                              <Shield className="w-4 h-4 text-red-500/50 flex-shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Radiation Hardening Techniques */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-light mb-2 text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Radiation Hardening Techniques
            </h2>
            <p className="text-sm text-gray-400 font-light">
              Industry-standard methods to mitigate radiation-induced faults in the lunar environment
            </p>
          </div>

          <div className="space-y-3">
            {radiationTechniques.map(tech => (
              <div 
                key={tech.id}
                className="border border-orange-500/30 bg-slate-800/30 rounded-lg overflow-hidden hover:border-orange-500/50 transition-all duration-200"
              >
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => toggleTechnique(tech.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-orange-300 mb-1">{tech.name}</h3>
                      <p className="text-sm text-gray-400 mb-2">{tech.description}</p>
                      <div className="flex gap-4 text-xs">
                        <span className="text-red-400">Mitigates: {tech.threat}</span>
                        <span className="text-blue-400">Location: {tech.location}</span>
                      </div>
                    </div>
                    {expandedTechniques[tech.id] ? 
                      <ChevronDown className="w-5 h-5 text-gray-500 ml-4" /> : 
                      <ChevronRight className="w-5 h-5 text-gray-500 ml-4" />
                    }
                  </div>
                </div>

                {expandedTechniques[tech.id] && (
                  <div className="px-4 pb-4 border-t border-slate-700/50">
                    <div className="bg-slate-950/80 border border-slate-700/50 rounded mt-4 p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-semibold text-green-400 flex items-center gap-2">
                          <Code className="w-3 h-3" />
                          IMPLEMENTATION
                        </span>
                        <span className="text-xs text-gray-600">C</span>
                      </div>
                      <pre className="text-xs text-green-300/90 overflow-x-auto font-mono leading-relaxed">
                        <code>{tech.code}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Critical Constants */}
        <div className="mb-8 bg-slate-800/30 border border-blue-500/30 rounded-lg p-6">
          <h2 className="text-xl font-light mb-4 text-blue-300">System Constants</h2>
          <div className="space-y-2">
            {constants.map((c, i) => (
              <div key={i} className="flex items-start gap-4 text-sm border-b border-slate-700/30 pb-2 last:border-0">
                <code className="text-purple-400 font-mono w-48 flex-shrink-0">{c.name}</code>
                <code className="text-green-400 font-mono w-24 flex-shrink-0">{c.value}</code>
                <span className="text-gray-400 font-light">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Implementation Roadmap */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-light mb-2 text-green-300 flex items-center gap-2">
              <Cpu className="w-6 h-6" />
              Implementation Roadmap
            </h2>
            <p className="text-sm text-gray-400 font-light">
              Phased approach for building and validating the solar tracker firmware
            </p>
          </div>

          <div className="space-y-3">
            {/* Phase 1 */}
            <div className="border border-green-500/30 bg-slate-800/30 rounded-lg p-5">
              <div className="flex items-start gap-4 mb-3">
                <div className="bg-green-900/50 text-green-300 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-green-300 mb-1">Foundation & Core Modules</h3>
                  <p className="text-sm text-gray-400 mb-3">Establish basic system infrastructure and prove hardware connectivity</p>
                  
                  <div className="space-y-2">
                    <div className="bg-slate-900/50 border border-slate-700/50 rounded p-3">
                      <div className="text-sm font-semibold text-yellow-400 mb-2">Tasks</div>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Set up Arduino IDE and development environment</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Implement Main Control Loop skeleton with watchdog</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Create Telemetry Module for debugging output</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Test basic serial communication and LED heartbeat</li>
                      </ul>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-700/50 rounded p-3">
                      <div className="text-sm font-semibold text-blue-400 mb-2">Deliverables</div>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li className="flex gap-2"><span className="text-blue-600">✓</span>100ms control loop executing reliably</li>
                        <li className="flex gap-2"><span className="text-blue-600">✓</span>Serial debugging output functional</li>
                        <li className="flex gap-2"><span className="text-blue-600">✓</span>Watchdog timer configured and tested</li>
                      </ul>
                    </div>
                    <div className="text-xs text-gray-500">Estimated time: 4-6 hours</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="border border-blue-500/30 bg-slate-800/30 rounded-lg p-5">
              <div className="flex items-start gap-4 mb-3">
                <div className="bg-blue-900/50 text-blue-300 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-blue-300 mb-1">Sensor Integration</h3>
                  <p className="text-sm text-gray-400 mb-3">Implement photoresistor reading with basic filtering</p>
                  
                  <div className="space-y-2">
                    <div className="bg-slate-900/50 border border-slate-700/50 rounded p-3">
                      <div className="text-sm font-semibold text-yellow-400 mb-2">Tasks</div>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Wire photoresistors to A0-A3 with voltage dividers</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Implement Sensor Management Module</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Add 3-sample median filter for each sensor</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Calculate light differential (quadrant comparison)</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Test with flashlight to verify directional sensitivity</li>
                      </ul>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-700/50 rounded p-3">
                      <div className="text-sm font-semibold text-blue-400 mb-2">Deliverables</div>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li className="flex gap-2"><span className="text-blue-600">✓</span>Sun position error vector (delta-azimuth, delta-elevation)</li>
                        <li className="flex gap-2"><span className="text-blue-600">✓</span>Sensor fault detection working</li>
                        <li className="flex gap-2"><span className="text-blue-600">✓</span>Serial output shows real-time light values</li>
                      </ul>
                    </div>
                    <div className="text-xs text-gray-500">Estimated time: 6-8 hours</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="border border-purple-500/30 bg-slate-800/30 rounded-lg p-5">
              <div className="flex items-start gap-4 mb-3">
                <div className="bg-purple-900/50 text-purple-300 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-purple-300 mb-1">Servo Control</h3>
                  <p className="text-sm text-gray-400 mb-3">Implement actuator control with position feedback</p>
                  
                  <div className="space-y-2">
                    <div className="bg-slate-900/50 border border-slate-700/50 rounded p-3">
                      <div className="text-sm font-semibold text-yellow-400 mb-2">Tasks</div>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Connect 3× servos to D9, D10, D11</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Implement Servo Driver Module with PWM generation</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Add write-verify cycle for each servo command</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Test individual servo movements</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Implement calibration and homing sequence</li>
                      </ul>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-700/50 rounded p-3">
                      <div className="text-sm font-semibold text-blue-400 mb-2">Deliverables</div>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li className="flex gap-2"><span className="text-blue-600">✓</span>Servos respond to position commands</li>
                        <li className="flex gap-2"><span className="text-blue-600">✓</span>Position verification working</li>
                        <li className="flex gap-2"><span className="text-blue-600">✓</span>Manual test: can position array arbitrarily</li>
                      </ul>
                    </div>
                    <div className="text-xs text-gray-500">Estimated time: 4-6 hours</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 4 */}
            <div className="border border-orange-500/30 bg-slate-800/30 rounded-lg p-5">
              <div className="flex items-start gap-4 mb-3">
                <div className="bg-orange-900/50 text-orange-300 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-orange-300 mb-1">Tracking Algorithm</h3>
                  <p className="text-sm text-gray-400 mb-3">Close the control loop with proportional controller</p>
                  
                  <div className="space-y-2">
                    <div className="bg-slate-900/50 border border-slate-700/50 rounded p-3">
                      <div className="text-sm font-semibold text-yellow-400 mb-2">Tasks</div>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Implement Tracking Algorithm Module</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Tune proportional gain (Kp) for smooth tracking</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Add ±2° dead-band to prevent oscillation</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Implement position limits and rate limiting</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Test closed-loop tracking with moving flashlight</li>
                      </ul>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-700/50 rounded p-3">
                      <div className="text-sm font-semibold text-blue-400 mb-2">Deliverables</div>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li className="flex gap-2"><span className="text-blue-600">✓</span>Array autonomously tracks light source</li>
                        <li className="flex gap-2"><span className="text-blue-600">✓</span>Stable tracking without hunting</li>
                        <li className="flex gap-2"><span className="text-blue-600">✓</span>Basic sun-loss detection working</li>
                      </ul>
                    </div>
                    <div className="text-xs text-gray-500">Estimated time: 6-8 hours</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 5 */}
            <div className="border border-red-500/30 bg-slate-800/30 rounded-lg p-5">
              <div className="flex items-start gap-4 mb-3">
                <div className="bg-red-900/50 text-red-300 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-red-300 mb-1">Safety & Fault Management</h3>
                  <p className="text-sm text-gray-400 mb-3">Add radiation hardening and fault tolerance</p>
                  
                  <div className="space-y-2">
                    <div className="bg-slate-900/50 border border-slate-700/50 rounded p-3">
                      <div className="text-sm font-semibold text-yellow-400 mb-2">Tasks</div>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Implement Safety Module with error counting</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Add TMR for critical state variables</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Implement CRC validation on inter-module data</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Add memory scrubbing background task</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Implement control flow checking</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Add graceful degradation state machine</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Implement fail-safe default position</li>
                      </ul>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-700/50 rounded p-3">
                      <div className="text-sm font-semibold text-blue-400 mb-2">Deliverables</div>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li className="flex gap-2"><span className="text-blue-600">✓</span>All radiation hardening techniques active</li>
                        <li className="flex gap-2"><span className="text-blue-600">✓</span>Fault injection tests pass</li>
                        <li className="flex gap-2"><span className="text-blue-600">✓</span>System recovers from simulated failures</li>
                        <li className="flex gap-2"><span className="text-blue-600">✓</span>Safe mode transition verified</li>
                      </ul>
                    </div>
                    <div className="text-xs text-gray-500">Estimated time: 10-12 hours</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 6 */}
            <div className="border border-yellow-500/30 bg-slate-800/30 rounded-lg p-5">
              <div className="flex items-start gap-4 mb-3">
                <div className="bg-yellow-900/50 text-yellow-300 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">
                  6
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-yellow-300 mb-1">Integration & Testing</h3>
                  <p className="text-sm text-gray-400 mb-3">Final validation and demonstration preparation</p>
                  
                  <div className="space-y-2">
                    <div className="bg-slate-900/50 border border-slate-700/50 rounded p-3">
                      <div className="text-sm font-semibold text-yellow-400 mb-2">Tasks</div>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Implement Power Management Module (optional)</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Full system integration test</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Extended runtime testing (multi-hour)</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Performance characterization (tracking accuracy, response time)</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Document test results and observations</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Prepare demonstration in dark room</li>
                        <li className="flex gap-2"><span className="text-gray-600">→</span>Create presentation materials</li>
                      </ul>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-700/50 rounded p-3">
                      <div className="text-sm font-semibold text-blue-400 mb-2">Deliverables</div>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li className="flex gap-2"><span className="text-blue-600">✓</span>Complete working solar tracker</li>
                        <li className="flex gap-2"><span className="text-blue-600">✓</span>Demonstration video recorded</li>
                        <li className="flex gap-2"><span className="text-blue-600">✓</span>Test report with performance metrics</li>
                        <li className="flex gap-2"><span className="text-blue-600">✓</span>Presentation deck complete</li>
                      </ul>
                    </div>
                    <div className="text-xs text-gray-500">Estimated time: 8-10 hours</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Timeline */}
          <div className="mt-6 bg-slate-800/30 border border-green-500/30 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-green-300">Total Project Timeline</h3>
              <span className="text-2xl font-light text-green-400">38-50 hours</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-900/50 border border-slate-700/50 rounded p-3">
                <div className="text-blue-400 font-semibold mb-1">Hardware Build</div>
                <div className="text-gray-400">Phase 1-4 • 20-28 hours • Working prototype</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-700/50 rounded p-3">
                <div className="text-red-400 font-semibold mb-1">Safety Hardening</div>
                <div className="text-gray-400">Phase 5-6 • 18-22 hours • Flight-ready features</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500 border-t border-slate-700/50 pt-3">
              <Keyword color="orange">Note:</Keyword> Times assume familiarity with Arduino and C programming. Add 30-50% for learning curve if new to embedded systems.
            </div>
          </div>
        </div>

        {/* Radiation Threat Summary */}
        <div className="mb-8 bg-slate-800/30 border border-red-500/30 rounded-lg p-6">
          <h2 className="text-xl font-light mb-4 text-red-300">Radiation Environment</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 border border-slate-700/50 rounded p-4">
              <div className="text-sm font-semibold text-red-400 mb-2">SEU • Single Event Upset</div>
              <div className="text-xs text-gray-400 mb-3">Bit flip in memory or register from particle strike</div>
              <div className="text-xs text-green-400">→ TMR, CRC, Memory Scrubbing</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-700/50 rounded p-4">
              <div className="text-sm font-semibold text-red-400 mb-2">SET • Single Event Transient</div>
              <div className="text-xs text-gray-400 mb-3">Temporary voltage spike in combinational logic</div>
              <div className="text-xs text-green-400">→ Median Filtering, Temporal Redundancy</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-700/50 rounded p-4">
              <div className="text-sm font-semibold text-red-400 mb-2">SEFI • Functional Interrupt</div>
              <div className="text-xs text-gray-400 mb-3">Control flow corruption, program counter upset</div>
              <div className="text-xs text-green-400">→ Watchdog, Control Flow Checking</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-xs border-t border-slate-800 pt-6">
          <p>Designed for NASA Artemis Mission • Space.Apps.Ottawa 2025</p>
          <p className="mt-1">Safety-Critical Embedded Systems Architecture</p>
        </div>
      </div>
    </div>
  );
};

export default SolarTrackerArchitecture;