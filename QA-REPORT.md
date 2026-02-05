# QA Report: AEGIS-BM Platform v0.2.0

**Date**: 2026-02-05  
**Scope**: Persistence + Plugins + UI Scan Verification

---

## Test Results Summary

### ✅ PASS: Backend Build & Run

- **Build**: `npm run build` completed successfully
- **TypeScript Compilation**: No errors
- **UI Build**: Vite build completed (46 modules, 181KB bundle)
- **Server Start**: `npm start` runs on port 4000
- **Fix Applied**: Updated `package.json` start script path from `dist/server/index.js` to `dist/src/server/index.js` (due to tsconfig rootDir change)

### ✅ PASS: BM Persistence

- **Test**: Created BM with ID `bm-persistent-01` and displayName `TestBM`
- **Verification**: Server restarted, BM persisted and retrieved via `/bm/list`
- **Ledger**: PCT.jsonl created in `data/` directory with `bm_meta` records
- **Hydration**: `DeployDepot.hydrate()` successfully reconstructs BMs from PCT ledger on startup

### ✅ PASS: Plugin Loader

- **Plugin Added**: `reverse` tool added to `plugins/tools/index.ts`
- **Registration**: Plugin appears in `/tools` endpoint response
- **Tools Available**: `echo`, `time`, `reverse`
- **Loader**: `loadPlugins()` executes before server listen, registering both built-in and plugin tools

### ✅ PASS: Posture Scan Coverage

- **Command**: `npm run posture:scan` executed successfully
- **Coverage**: Scans both backend (`src/`) and UI (`ui/src/`) due to recursive walk from project root
- **Strict Mode**: `--strict` flag support added for CI/CD (exits with code 1 on warnings)
- **Output**: Reports drift markers with file path, line number, and matched term

---

## Files Modified

### Core Implementation

1. **`src/depots/deploy.ts`**: Added `hydrate()`, updated `deployBM()` and `listBMs()` for persistence
2. **`src/depots/registry.ts`**: NEW - Depot registry system
3. **`src/core/plugins.ts`**: Rewritten for index-based plugin loading
4. **`src/server/index.ts`**: Added hydration call, depot registry imports, `/depots` endpoint
5. **`tsconfig.json`**: Changed `rootDir` to `.`, added `plugins/**/*` to includes

### Plugin System

6. **`plugins/tools/index.ts`**: Added `reverse` tool example
2. **`plugins/depots/index.ts`**: Empty array (ready for depot plugins)

### Configuration & Scripts

8. **`package.json`**: Fixed start script path, version 0.2.0
2. **`scripts/posture-scan.mjs`**: Added `--strict` mode support

### Documentation

10. **`README.md`**: Added "Resilience & Persistence", "Plugins", and "Posture Scan" sections

---

## Known Issues & Notes

### Minor Issues

- **UI Lint Warnings**: 99+ CSS inline style warnings in UI components (not blocking, cosmetic)
- **Dev Mode**: `npm run dev` (ts-node) has module resolution issues; use `npm start` instead

### Observations

- **Ledger Files**: PCT.jsonl now stores BM metadata; SPINE.jsonl contains legacy formations
- **Plugin Execution**: Tools are registered but no generic `/tools/execute` endpoint exists (would need to be added for runtime execution via HTTP)
- **UI Build**: Separate from backend, builds to `ui/dist/`

---

## Recommendations

1. **Add Tool Execution Endpoint**: Consider adding `POST /tools/:name/execute` for testing plugin tools via HTTP
2. **UI Lint Cleanup**: Move inline styles to external CSS files (low priority)
3. **CI Integration**: Use `npm run posture:scan -- --strict` in CI pipeline
4. **Documentation**: Add example depot plugin to README

---

## Conclusion

**All QA objectives PASSED**:

- ✅ Backend builds and runs
- ✅ UI builds and runs  
- ✅ BM persistence survives restart
- ✅ Plugin loader works (reverse tool registered)
- ✅ Posture scan covers UI

The platform is ready for v0.2.0 release with full persistence, plugin extensibility, and posture compliance scanning.
