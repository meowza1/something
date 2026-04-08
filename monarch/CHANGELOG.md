# MONARCH Script Changelog

## Format
- **+0.1**: Small updates/fixes (minor improvements, bug fixes, URL fixes)
- **+1.0**: Big updates/fixes (major feature additions, significant improvements)

## Changelog

### [+0.3] 2026-04-07 20:37:04 - Initial Setup & URL Fixes
- Downloaded original JUJU script from Discord URL
- Created juju directory and saved script as message.txt
- **Fixed**: Commented out 3 problematic URLs returning 404 errors:
  - `https://discord-lookup-api-pied.vercel.app/v1/user/` (2 instances)
  - `https://www.roblox.com/users/` (1 instance)

### [+1.0] 2026-04-07 20:37:04 - Resolver System Enhancement
- **Added**: Advanced resolver configuration with multiple modes:
  - Basic mode (default): Original functionality
  - Advanced mode: Position history smoothing for stable targeting
  - Predictive mode: Velocity-based prediction for moving targets
- **Added**: Resolver history tracking with smoothing capabilities (max 5 entries)
- **Added**: Resolver mode selection dropdown in UI (Basic/Advanced/Predictive)
- **Enhanced**: Resolver logic with intelligent smoothing and prediction algorithms
- **Fixed**: Vector3 reference to use existing `vector3_new` variable
- **Improved**: Overall resolver accuracy and stability against evasive targets

### [+0.1] 2026-04-08 08:44:47 - Rebranding Initiation & Analysis
- **Started**: Rebranding process from JUJU to MONARCH
- **Added**: points.md file with comprehensive improvement suggestions
- **Analyzed**: Complete script structure and functionality
- **Updated**: Changelog format to reflect MONARCH branding
- **Prepared**: Foundation for systematic replacement of JUJU references

### [+1.0] 2026-04-08 10:28:31 - Complete MONARCH Rebranding
- **Rebranded**: Global variable from `juju` to `monarch`
- **Updated**: Menu colors key from `["juju"]` to `["monarch"]`
- **Changed**: Logo text from "juju" to "monarch"
- **Renamed**: Menu text variable from `juju_text` to `monarch_text`
- **Updated**: Folder name from "juju recode" to "monarch recode" throughout script
- **Fixed**: Anti-detection kick message to reference MONARCH
- **Maintained**: GitHub asset URLs unchanged (external repository)
- **Completed**: Systematic replacement of all internal JUJU references to MONARCH

### [+0.1] 2026-04-08 10:35:42 - Documentation Enhancement
- **Updated**: important.md title to MONARCH branding
- **Added**: Comprehensive script sections mapping with line numbers
- **Organized**: Feature modules by category (Movement, ESP, Combat, etc.)
- **Mapped**: Key systems and their locations in the codebase
- **Improved**: Navigation and understanding of script structure

### [+0.1] 2026-04-08 11:01:32 - Features Documentation
- **Created**: features.md with complete feature inventory
- **Documented**: 85+ individual features across 11 categories
- **Detailed**: All settings, toggles, sliders, dropdowns, and colorpickers
- **Organized**: By functionality (Combat, Movement, Visuals, etc.)
- **Included**: Configuration ranges, defaults, and descriptions

### [+1.0] 2026-04-08 11:16:39 - Advanced Strafe & Resolver Improvements
- **Enhanced Strafe System**:
  - **Added**: Circle strafe, Figure-8 strafe, Adaptive strafe modes
  - **Added**: Strafe radius control (5-50 studs, default 15)
  - **Added**: Direction options (clockwise/counterclockwise/random)
  - **Added**: Predictive strafe based on target movement
  - **Improved**: Dynamic radius variation for adaptive mode unpredictability
  - **Removed**: Wall collision avoidance toggle (redundant with noclip)
- **Advanced Resolver System**:
  - **Added**: Adaptive resolver mode with automatic mode switching based on accuracy
  - **Added**: Machine Learning mode using pattern recognition for movement prediction
  - **Added**: Confidence threshold slider (10-95%, default 75%)
  - **Added**: History size control (3-15 entries, default 5)
  - **Enhanced**: Predictive mode with acceleration calculations
  - **Improved**: ML mode analyzes repeating movement patterns
  - **Added**: Resolver effectiveness tracking and dynamic adaptation

### [+0.2] 2026-04-08 11:25:30 - Anti-Detection Automiss System
- **Added**: Automiss feature to prevent 100% accuracy bans
- **Enabled by Default**: Automiss toggle active on script start
- **Configurable**: Miss chance slider (0-50%, default 15%)
- **Adjustable**: Miss distance slider (1-20 studs, default 8)
- **Integrated**: Works with ragebot, silent aim, and all shooting systems
- **Random Direction**: Shots miss above/below/left/right of target
- **Anti-Detection**: Reduces perfect accuracy that triggers bans

### [+0.3] 2026-04-08 12:30:15 - Flame Method Implementation
- **Added**: Flame method physics manipulation for ragebot targeting
- **Two Methods**: PhysicsRepRootPart manipulation and velocity zeroing with angular control
- **Physics Rep Method**: Continuously sets PhysicsRepRootPart to follow target's root part
- **Velocity Zero Method**: Zeros all velocities while manipulating angles for smooth following
- **Configurable**: Method type selection and speed multiplier (1-50x, default 10)
- **Anti-Detection**: Advanced physics-based following using hidden properties
- **Integrated**: Automatically activates when ragebot locks onto a target

### [+1.0] 2026-04-08 13:15:22 - Advanced Desync Systems
- **Enhanced Velocity Desync**:
  - **Added**: 4 new velocity types - random, chaotic, sine wave, predictive
  - **Added**: Intensity control (10-500%, default 100%) for velocity scaling
  - **Added**: Frequency control (1-20hz, default 5) for timing variations
  - **Added**: Adaptive scaling based on health percentage
  - **Improved**: Chaotic mode uses sine/cosine waves for unpredictable patterns
  - **Enhanced**: Predictive mode counters anti-cheats using velocity prediction
- **Removed Network Desync**: Feature patched and removed entirely from script

---