# JUJU Script Changelog

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

---

*Rule: This changelog will be updated after every addition/fix/enhancement to the JUJU script following the versioning format specified above.*